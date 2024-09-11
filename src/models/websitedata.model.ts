import { model, Schema, Types } from "mongoose";

export interface IWebsiteData {
    shopImage: string;
    createdAt: Date;
    updateAt: Date;
}

const websiteData = new Schema<IWebsiteData>(
    {
        shopImage: String,
    },
    { timestamps: true }
);

export const WebsiteData = model<IWebsiteData>("websiteData", websiteData);
