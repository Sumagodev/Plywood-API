import mongoose, { model, Schema, Types } from "mongoose";

export interface IBrand {
  name: string;
  slug:String,
  image: string;
  status:Boolean;
  createdAt: Date;
  updateAt: Date;
}

const brand = new Schema<IBrand>(
  {
    name: String,
    slug:String,
    image:{type:String, default:""},
    status:{type:Boolean, default:false},
  },
  { timestamps: true }
);

export const Brand = model<IBrand>("brand", brand);
