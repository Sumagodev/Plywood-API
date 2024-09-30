import mongoose, { model, Schema, Types } from "mongoose";

export interface ISubscription {
  includesFlashSales: Boolean;
  includesAdvertisements: Boolean;
  includesValidity: Boolean;
  numberOfAdvertisement: Number;
  advertisementDays: Number;
  numberOfBannerImages: Number,
  bannerimagesDays: Number,
  noOfMonth: Number;
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

const userSubscription = new Schema<ISubscription>(
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

    includesValidity: Boolean,

    numberOfAdvertisement: { type: Number, default: 0 },

    advertisementDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    noOfMonth: Number,

    saleDays: { type: Number, default: 0 },
    endDate: Date,
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserSubscription = model<ISubscription>("UserSubscription", userSubscription);
