import mongoose, { model, Schema, Types } from "mongoose";
import { APPROVED_STATUS } from "../helpers/constant";

export interface IProduct {
  name: string;
  slug: String,
  brand: String,
  categoryId: Types.ObjectId | any;
  categoryArr: [
    {
      _id: Types.ObjectId;
      categoryId: Types.ObjectId;
    }
  ];
  price: String,
  sellingprice: String,
  specification: {
    thickness: String,
    application: String,
    grade: String,
    color: String,
    size: String,
    wood: String,
    glue: String,
    warranty: String,
  },
  shortDescription: String,
  longDescription: String,
  mainImage: String,
  imageArr: [],
  video: String,
  brochure: String,
  createdById: Types.ObjectId | any,
  createdByObj: any,
  status: Boolean,
  approved: String,
  createdAt: Date;
  updateAt: Date;
}

const product = new Schema<IProduct>(
  {
    name: String,
    slug: String,
    brand: String,
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
    categoryArr: [
      {
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "category",
        },
      },
    ],
    price: String,
    sellingprice: String,
    specification: {
      thickness: String,
      application: String,
      grade: String,
      color: String,
      size: String,
      wood: String,
      glue: String,
      warranty: String,
    },
    shortDescription: String,
    longDescription: String,
    mainImage: String,
    imageArr: [],
    video: String,
    brochure: String,
    createdById: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdByObj: {},
    status: { type: Boolean, default: false },
    approved: { type: String, default: false},
  },
  { timestamps: true }
);

export const Product = model<IProduct>("product", product);
