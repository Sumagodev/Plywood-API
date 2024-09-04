

import { model, Schema } from "mongoose";

export interface INotifications {
    userId: Schema.Types.ObjectId,
    title: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updateAt: Date;
}

const notifications = new Schema<INotifications>(
    {
        userId: {
            type: Schema.Types.ObjectId
        },
        title: String,
        content: String,
        isRead:{type:Boolean,default:false},
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 15*60*60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
          },
    }
);

export const Notifications = model<INotifications>("notifications", notifications);
