import { model, Schema } from "mongoose";

export interface ITopup {
  name: string;
  description: string;
  role: string;
  includesFlashSales: Boolean;
  includesAdvertisements: Boolean;
  numberOfAdvertisement: Number,
  advertisementDays: Number,
  price: Number,
  numberOfSales: Number,
  numberOfBannerImages: Number,
  bannerimagesDays: Number,
  saleDays: Number,
  messageArr: [{
    message: String
  }],
  createdAt: Date;
  updateAt: Date;
}

const topup = new Schema<ITopup>(
  {

    name: String,

    description: String,
    role: String,



    price: Number,
    includesFlashSales: Boolean,
    includesAdvertisements: Boolean,
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    numberOfSales: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },

    messageArr: Array

  },
  { timestamps: true }
);

export const Topup = model<ITopup>("topup", topup);
