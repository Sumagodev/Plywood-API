import mongoose, { model, Schema, Types } from "mongoose";

export interface ILead {
    userId: string;
    phone: string;
    email: string;
    name: string;
    productId: string;
    createdById: string;
    status: string,
    createdAt: Date;
    updateAt: Date;
}

const lead = new Schema<ILead>(
    {
        userId: String,
        phone: String,
        email: String,
        name: String,
        productId: String,
        status: String,
        createdById: String,
    },
    { timestamps: true }
);

export const Lead = model<ILead>("lead", lead);
