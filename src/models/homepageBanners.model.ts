import { model, Schema, Types } from "mongoose";

export interface IhomepageBanners {
    image: string;
    createdAt: Date;
    updateAt: Date;
}

const homepageBanners = new Schema<IhomepageBanners>(
    {
        image: String,
    },
    { timestamps: true }
);

export const HomepageBanners = model<IhomepageBanners>("homepageBanners", homepageBanners);
