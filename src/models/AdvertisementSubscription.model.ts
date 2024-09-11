import { model, Schema, Types } from "mongoose";

export interface IAdvertisement {
  productId: string | Types.ObjectId;
  productSlug: String;
  userId: string | Types.ObjectId;
  image: string;
  message: String;
  isVideo: Boolean,
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updateAt: Date;
}

const advertisements = new Schema<IAdvertisement>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isVideo: { type: Boolean, default: false },
    productSlug: String,
    image: String,
    message: String,
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const Advertisement = model<IAdvertisement>("advertisement", advertisements);
