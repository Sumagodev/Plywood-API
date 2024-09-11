import mongoose, { model, Schema, Types } from "mongoose";

export interface ICountry {
  name: string;
  status:Boolean;
  createdAt: Date;
  updateAt: Date;
}

const country = new Schema<ICountry>(
  {
    name: String,
    status:{type:Boolean, default:false},
  },
  { timestamps: true }
);

export const Country = model<ICountry>("country", country);
