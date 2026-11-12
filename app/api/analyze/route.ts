import { NextRequest, NextResponse } from 'next/server';
import * as tf from '@tensorflow/tfjs';

// Pre-trained IMDB movie-review sentiment model from the TensorFlow.js team.
// It expects each text as a sequence of word ids from its own vocabulary,
// which is published alongside the model in metadata.json.
const MODEL_BASE_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1';
const PAD_INDEX = 0;
const OOV_INDEX = 2; // id the model uses for "word not in vocabulary"

type SentimentModel = {
  model: tf.LayersModel;
  wordIndex: Record<string, number>;
  indexFrom: number;
  maxLen: number;
  vocabularySize: number;
};

let cached: Promise<SentimentModel> | null = null;

function loadSentimentModel(): Promise<SentimentModel> {
  if (!cached) {
    cached = (async () => {
      await tf.ready();
      const [model, metadata] = await Promise.all([
        tf.loadLayersModel(`${MODEL_BASE_URL}/model.json`),
        fetch(`${MODEL_BASE_URL}/metadata.json`).then((res) => {
          if (!res.ok) throw new Error(`metadata.json returned ${res.status}`);
          return res.json();
        }),
      ]);
      return {
        model,
        wordIndex: metadata.word_index,
        indexFrom: metadata.index_from,
        maxLen: metadata.max_len,
        vocabularySize: metadata.vocabulary_size,
      };
    })();
    // Don't cache a failure; retry on the next request.
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

const apiKey = process.env.YOUTUBE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: 'YOUTUBE_API_KEY is not set on the server' }, { status: 500 });
    }

    const { videoUrl } = await req.json();
    if (!videoUrl) {
      return NextResponse.json({ error: 'Missing video URL' }, { status: 400 });
    }

    const videoId = extractYoutubeVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.' }, { status: 400 });
    }

    let sentiment: SentimentModel;
    try {
      sentiment = await loadSentimentModel();
    } catch (error) {
      console.error('Failed to load sentiment model:', error);
      return NextResponse.json({ error: 'Failed to load sentiment model' }, { status: 500 });
    }

    const videoDetails = await fetchVideoDetails(videoId);
    if (!videoDetails) {
      return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 500 });
    }

    const [descriptionSentiment] = classify(sentiment, [videoDetails.description]);
    const { positiveCommentCount, negativeCommentCount, voteCounts } =
      await analyzeCommentsSentimentAndVotes(sentiment, videoId);

    return NextResponse.json({
      title: videoDetails.title,
      views: videoDetails.views,
      likes: videoDetails.likes,
      sentiment: descriptionSentiment,
      commentCount: videoDetails.commentCount,
      positiveCommentCount,
      negativeCommentCount,
      voteCounts, // counts for A1, B2, C*3
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&.*)?$/,
    /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
    /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchVideoDetails(videoId: string) {
  try {
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
    const response = await fetch(youtubeApiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API error:', data?.error?.message ?? response.status);
      return null;
    }
    if (!data.items?.length) return null;

    const video = data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      views: video.statistics.viewCount,
      likes: video.statistics.likeCount,
      commentCount: video.statistics.commentCount,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

async function analyzeCommentsSentimentAndVotes(sentiment: SentimentModel, videoId: string) {
  const empty = {
    positiveCommentCount: 0,
    negativeCommentCount: 0,
    voteCounts: { A1: 0, B2: 0, C3: 0 },
  };

  try {
    const youtubeCommentsApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?videoId=${videoId}&part=snippet&maxResults=100&key=${apiKey}`;
    const response = await fetch(youtubeCommentsApiUrl);
    const data = await response.json();

    // Comments can be disabled on a video; that's not an error for us.
    if (!response.ok || !data.items?.length) return empty;

    // textOriginal is plain text; textDisplay contains HTML.
    const comments: string[] = data.items.map(
      (item: any) => item.snippet.topLevelComment.snippet.textOriginal ?? ''
    );

    let positiveCommentCount = 0;
    let negativeCommentCount = 0;
    for (const label of classify(sentiment, comments)) {
      if (label === 'positive') positiveCommentCount++;
      else if (label === 'negative') negativeCommentCount++;
    }

    const voteCounts = { A1: 0, B2: 0, C3: 0 };
    for (const comment of comments) {
      voteCounts.A1 += (comment.match(/\bA1\b/gi) || []).length;
      voteCounts.B2 += (comment.match(/\bB2\b/gi) || []).length;
      voteCounts.C3 += (comment.match(/\bC\*3\b/gi) || []).length;
    }

    return { positiveCommentCount, negativeCommentCount, voteCounts };
  } catch (error) {
    console.error('Error fetching or analyzing comments:', error);
    return empty;
  }
}

type SentimentLabel = 'positive' | 'negative' | 'unknown';

// Scores all texts in one batch. Texts with no words come back as 'unknown'.
function classify(sentiment: SentimentModel, texts: string[]): SentimentLabel[] {
  const sequences = texts.map((text) => textToSequence(sentiment, text));
  const scorable = sequences.filter((s) => s !== null) as number[][];
  if (scorable.length === 0) return texts.map(() => 'unknown');

  let scores: Float32Array | Int32Array | Uint8Array;
  try {
    scores = tf.tidy(() => {
      const input = tf.tensor2d(scorable, [scorable.length, sentiment.maxLen]);
      return (sentiment.model.predict(input) as tf.Tensor).dataSync();
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return texts.map(() => 'unknown');
  }

  let next = 0;
  return sequences.map((s) => {
    if (s === null) return 'unknown';
    return scores[next++] > 0.5 ? 'positive' : 'negative';
  });
}

// Turns text into the fixed-length list of word ids the model was trained on:
// lowercase words looked up in the vocabulary, unknown/rare words mapped to
// OOV, then left-padded (or trimmed from the front) to maxLen.
function textToSequence(sentiment: SentimentModel, text: string): number[] | null {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return null;

  const ids = words.map((word) => {
    const index = sentiment.wordIndex[word];
    if (index === undefined) return OOV_INDEX;
    const id = index + sentiment.indexFrom;
    return id >= sentiment.vocabularySize ? OOV_INDEX : id;
  });

  const trimmed = ids.slice(-sentiment.maxLen);
  const padding = new Array(sentiment.maxLen - trimmed.length).fill(PAD_INDEX);
  return [...padding, ...trimmed];
}
