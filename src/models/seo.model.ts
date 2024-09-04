import mongoose, { model, Schema, Types } from "mongoose";

export interface ISeo{
  name: string;
  url: String,
  description: string;
  image: string;
  keywords: string;
  title: string;
  status: Boolean;
  createdAt: Date;
  updateAt: Date;
}

const seos = new Schema<ISeo>(
  {
    name: String,
    url: String,
    description: String,
    keywords: String,
    title: String,
    image: { type: String, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Seo = model<ISeo>("Seo", seos);

