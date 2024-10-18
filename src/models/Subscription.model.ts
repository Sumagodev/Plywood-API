import mongoose, { model, Schema, Types } from "mongoose";
import { SUBSCRIPTION_TYPE } from "../helpers/constant";

export interface ISubscription {
  name: string;
  description: string;
  role: string;
  includesFlashSales: Boolean;
  includesAdvertisements: Boolean;
  includesBannerImages: Boolean,
  subscriptiontype:String;
  includesValidity: Boolean;
  numberOfAdvertisement: Number,
  advertisementDays: Number,
  price: Number,
  numberOfSales: Number,
  noOfMonth: Number,
  saleDays: Number,
  messageArr: [{
    message: String
  }],
  createdAt: Date;
  updateAt: Date;
}

const subscription = new Schema<ISubscription>(
  {

    name: String,

    description: String,
    role: String,
    noOfMonth: { type: Number, default: 0 },
    subscriptiontype: { type: String, default: SUBSCRIPTION_TYPE.REGULAR  },
    price: Number,
    includesFlashSales: Boolean,
    includesAdvertisements: Boolean,
    includesBannerImages: Boolean,

    includesValidity: Boolean,
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },

    numberOfSales: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },

    messageArr: Array

  },
  { timestamps: true }
);

export const Subscription = model<ISubscription>("subscription", subscription);
