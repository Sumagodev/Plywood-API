import { model, Schema } from "mongoose";

export interface IUserTicketsMessage {
    message: string;
    userTicketsId: String;
    userId: string;
    createdAt: Date;
    updateAt: Date;
}

const userTicketsMessage = new Schema<IUserTicketsMessage>(
    {
        message: String,
        userTicketsId: String,
        userId: String,
    },
    { timestamps: true }
);

export const UserTicketsMessage = model<IUserTicketsMessage>("userTicketsMessage", userTicketsMessage);
