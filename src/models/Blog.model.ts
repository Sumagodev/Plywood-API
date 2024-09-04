import mongoose, { model, Schema, Types } from "mongoose";

export interface IBlogs {
  name: string;
  slug: String,
  description: string;
  image: string;
  status: Boolean;
  createdAt: Date;
  updateAt: Date;
}

const blogs = new Schema<IBlogs>(
  {
    name: String,
    slug: String,
    description: String,
    image: { type: String, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Blogs = model<IBlogs>("Blogs", blogs);
