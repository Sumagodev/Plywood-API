import mongoose, { Schema, model, Types } from 'mongoose';

export interface IStateDetail {
  stateId: Types.ObjectId;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const stateDetailSchema = new Schema<IStateDetail>(
  {
    stateId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const StateDetail = model<IStateDetail>('StateDetail', stateDetailSchema);
