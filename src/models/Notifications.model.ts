import { model, Schema } from "mongoose";

export interface INotifications {
    userId: Schema.Types.ObjectId;
    type: string;
    title: string;
    targetId: string;
    sourceId: string;
    content: string;
    isRead: boolean;
    viewCount: number;            // Top-level viewCount field
    lastAccessTime: Date;         // Top-level lastAccessTime field
    payload: any;                 // Dynamic data (can be any structure)
    createdAt: Date;
    updatedAt: Date;
}

const notifications = new Schema<INotifications>(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },
    title: String,
    content: String,
    type: String,
    isRead: { type: Boolean, default: false },
    viewCount: { type: Number, default: 1 },        // Initialize viewCount with default value 1
    lastAccessTime: { type: Date, default: Date.now }, // Initialize lastAccessTime to current time
    payload: { 
      type: Object, 
      default: {}   // Keep payload for dynamic data
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically handle createdAt and updatedAt
  }
);

export const Notifications = model<INotifications>("notifications", notifications);
