import { model, Schema, Types } from "mongoose";

export interface IBannerImages {
  productId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  image: string;
  type: string;
  isVerified: Boolean,
  endDate: Date;
  startDate: Date;
  createdAt: Date;
  updateAt: Date;

}

const BannerImages = new Schema<IBannerImages>(
  {
    type: String,
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isVerified: { type: Boolean, default: false },
    image: String,

    endDate: { type: Date, default: new Date() },
    startDate: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

export const BannerImage = model<IBannerImages>("bannerImages", BannerImages);
