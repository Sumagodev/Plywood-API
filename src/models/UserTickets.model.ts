import { model, Schema, Types } from "mongoose";

export interface IUserTickets {
    name: string;
    userId: Types.ObjectId | any;
    createdAt: Date;
    updateAt: Date;
}

const userTickets = new Schema<IUserTickets>(
    {
        name: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const UserTickets = model<IUserTickets>("userTickets", userTickets);
