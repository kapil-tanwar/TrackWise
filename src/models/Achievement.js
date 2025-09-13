import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '🏆',
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  xpReward: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);
