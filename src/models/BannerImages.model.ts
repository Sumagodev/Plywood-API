import { model, Schema, Types } from "mongoose";

export interface IBannerImages {
  productId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  image: string;

  isVerified: Boolean,
  
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
    image: String,
 
   
  },
  { timestamps: true }
);

export const BannerImage = model<IBannerImages>("bannerImages", BannerImages);
