import mongoose, { model, Schema, Types } from "mongoose";

export interface ICategory {
  name: string;
  slug: String,
  parentCategoryId: string;
  parentCategoryArr: [
    {
      _id?: Types.ObjectId;
      parentId: string | Types.ObjectId;
    }
  ];
  level: number;
  image: string;
  bannerImage: string;
  status: Boolean;
  createdAt: Date;
  updateAt: Date;
}

const category = new Schema<ICategory>(
  {
    name: String,
    slug: String,
    parentCategoryId: String, //direct parent id
    parentCategoryArr: [
      {
        parentId: String,
      },
    ],
    level: {
      type: Number,
      default: 1,
    },
    image: { type: String, default: "" },
    bannerImage: { type: String, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("category", category);
