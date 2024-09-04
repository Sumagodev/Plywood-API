import mongoose, { model, Schema, Types } from "mongoose";

export interface IBlogVideos {
  url: string;
  name: string;
  status: Boolean;
  createdAt: Date;
  updateAt: Date;
}

const blogVideos = new Schema<IBlogVideos>(
  {
    url: String,
    name: String,
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BlogVideos = model<IBlogVideos>("BlogVideos", blogVideos);
