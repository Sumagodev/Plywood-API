import mongoose, { model, Schema, Types } from "mongoose";

export interface IUserTopup {
  includesFlashSales: Boolean;
  includesAdvertisements: Boolean;
  numberOfAdvertisement: Number;
  advertisementDays: Number;
  numberOfBannerImages: Number,
  bannerimagesDays: Number,
  name: string;
  orderId: string;
  description: Boolean;
  userId: string;
  subscriptionId: string;
  numberOfSales: Number;
  saleDays: Number;
  price: Number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updateAt: Date;
  isExpired: Boolean;
}

const userTopup = new Schema<IUserTopup>(
  {
    name: String,
    orderId: String,
    description: String,
    userId: String,
    subscriptionId: String,
    price: Number,
    startDate: Date,
    numberOfSales: Number,
    includesFlashSales: Boolean,
    includesAdvertisements: Boolean,
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },
    endDate: Date,
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserTopup = model<IUserTopup>("UserTopup", userTopup);
