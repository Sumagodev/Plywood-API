import mongoose, { model, Schema, Types } from "mongoose";

export interface ICity {
  name: string;
  status: Boolean;
  stateId: String,
  countryId: String,
  image: String,
  createdAt: Date;
  updateAt: Date;
}

const city = new Schema<ICity>(
  {
    name: String,
    stateId: String,
    countryId: String,
    image: String,
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const City = model<ICity>("city", city);
