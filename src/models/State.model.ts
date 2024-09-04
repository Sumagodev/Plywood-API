import mongoose, { model, Schema, Types } from "mongoose";

export interface IState{
  name: string;
  status:Boolean;
  countryId:String,
  createdAt: Date;
  updateAt: Date;
}

const state = new Schema<IState>(
  {
    name: String,
    countryId:String,
    status:{type:Boolean, default:false},
  },
  { timestamps: true }
);

export const State= model<IState>("state", state);
