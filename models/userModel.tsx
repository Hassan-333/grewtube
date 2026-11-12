import mongoose, { Schema, Document } from 'mongoose';

interface User extends Document {
  username: string;
  email: string;
  password?: string;
  role: string;
  provider?: string;
  links?: {
    _id: mongoose.Types.ObjectId;
    url: string;
    createdAt: Date; 
    winningVote?: string; 
  }[];
}

const userSchema = new Schema<User>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    default: 'user', 
  },
  provider: {
    type: String,  
    default: 'credentials',  
  },
  links: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      url: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      winningVote: { 
        type: String,
        required: false,
      },
    },
  ],
}, { timestamps: true });

// Reuse the compiled model across hot reloads. The cast gives TypeScript a
// single model type instead of an un-callable union.
const User = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', userSchema);
export default User;
