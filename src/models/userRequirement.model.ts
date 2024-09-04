import { model, Schema, Types } from "mongoose";

export interface IUserRequirement {
    name: string;
    phone: string;
    address: string;
    productName: string;
    createdAt: Date;
    updateAt: Date;
}

const userRequirement = new Schema<IUserRequirement>(
    {
        name: String,
        phone: String,
        address: String,
        productName: String,
    },
    { timestamps: true }
);

export const UserRequirement = model<IUserRequirement>("userRequirement", userRequirement);
