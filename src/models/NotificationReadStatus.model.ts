import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationReadStatusSchema = new Schema({
  notificationId: { type: Schema.Types.ObjectId, required: true, ref: 'Notification' },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  readAt: { type: Date, default: Date.now }
});

// Create a compound index to speed up lookups
NotificationReadStatusSchema.index({ notificationId: 1, userId: 1 }, { unique: true });

export const NotificationReadStatus = mongoose.model('NotificationReadStatus', NotificationReadStatusSchema);

