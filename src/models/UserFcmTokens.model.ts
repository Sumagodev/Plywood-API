

import { model, Schema } from "mongoose";

export interface IUserFcmTokens {
    userId: Schema.Types.ObjectId,
    fcmToken: string,
    createdAt: Date;
    updateAt: Date;
}

const userFcmTokens = new Schema<IUserFcmTokens>(
    {

        userId: {
            type: Schema.Types.ObjectId
        },
        fcmToken: String


    },
    { timestamps: true }
);

export const UserFcmToken = model<IUserFcmTokens>("userFcmToken", userFcmTokens);
