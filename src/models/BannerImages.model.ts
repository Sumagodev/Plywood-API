import { model, Schema, Types } from "mongoose";

export interface IBannerImages {
  productId: string | Types.ObjectId;
  productSlug: String;
  userId: string | Types.ObjectId;
  image: string;

  isVerified: Boolean,
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updateAt: Date;
}

const BannerImages = new Schema<IBannerImages>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isVerified: { type: Boolean, default: false },
    productSlug: String,
    image: String,
 
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const BannerImage = model<IBannerImages>("bannerImages", BannerImages);
