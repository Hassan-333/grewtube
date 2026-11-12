import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WinningVote {
    url: string;
    winningVoteCount: number;
    label: string; // A1, B2, C*3, etc.
}

const WinningVoteChart: React.FC = () => {
    const [chartData, setChartData] = useState<{
        labels: string[]; // Labels for the left side
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
        }[];
    }>({
        labels: [], // Initially empty, will be populated with winning vote labels like A1, B2, etc.
        datasets: [
            {
                label: 'Winning Votes',
                data: [], // Will be populated with the corresponding vote count
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    });

    const [winningVotes, setWinningVotes] = useState<WinningVote[]>([]); // State to store the fetched winning votes

    useEffect(() => {
        const fetchWinningVotes = async () => {
            try {
                const response = await fetch('/api/users/getWinningVote');
                const result: WinningVote[] = await response.json();

                // Create labels and data based on the fetched result
                const labels = result.map(item => item.label); // A1, B2, C*3
                const data = result.map(item => {
                    // Map the vote count to the vertical position (A1 -> 1, B2 -> 2, C*3 -> 3)
                    const voteMapping = {
                        A1: 1,
                        B2: 2,
                        'C*3': 3,
                    };
                    return voteMapping[item.label] || 0; // Map label to index or 0 if not found
                });

                setWinningVotes(result); // Store the result in state

                setChartData({
                    labels, // Use the mapped labels (A1, B2, C*3)
                    datasets: [
                        {
                            label: 'Winning Votes',
                            data, // Set the mapped data
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching winning votes:', error);
            }
        };

        fetchWinningVotes();
    }, []);

    // Add more spacing between the labels
    const labelsWithSpacing = chartData.labels.flatMap((label, index) => {
        const space = index < chartData.labels.length - 1 ? [''] : []; // Add space between labels
        return [label, ...space];
    });

    return (
        <div>
            <Bar 
                data={{
                    ...chartData,
                    labels: labelsWithSpacing, // Use the labels with added spacing
                }} 
                options={{ 
                    responsive: true, 
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (tooltipItem) => {
                                    const index = tooltipItem.dataIndex;
                                    return [
                                        `${chartData.labels[index]}: ${chartData.datasets[0].data[index]}`, 
                                        `URL: ${winningVotes[index]?.url}` // Show the corresponding URL
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'URLs', // Title for the bottom labels
                            },
                            ticks: {
                                callback: (value, index) => {
                                    return `Link ${index + 1}`; // Dynamically show Link 1, Link 2, Link 3, etc.
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Winning Votes', // Title for the left side
                            },
                            ticks: {
                                // callback: (value, index) => {
                                //     // Add spaces before A1 to push it up
                                //     if (chartData.labels[index] === 'A1') {
                                //         return '  A1'; // Add spaces for A1
                                //     }
                                //     return labelsWithSpacing[index]; // Show other labels normally
                                // },
                                padding: 20, // Optional: Add padding for more spacing
                            },
                        },
                    },
                }} 
            />
        </div>
    );
};

export default WinningVoteChart;
