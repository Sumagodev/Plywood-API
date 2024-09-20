import { model, Schema, Types } from "mongoose";

export interface IQuickenEuiry {
    name: string;
    phone: string;
    meassage: string;
    createdAt: Date;
    updateAt: Date;
}

const QuickenEuiry = new Schema<IQuickenEuiry>(
    {
        name: String,
        phone: String,
        meassage: String,
    },
    { timestamps: true }
);

export const quickenquiry = model<IQuickenEuiry>("quickenquiry", QuickenEuiry);
