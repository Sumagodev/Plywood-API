import mongoose, { model, Schema, Types } from "mongoose";

export interface IVendorReview {
    userId: Types.ObjectId;
    rating: number;
    message: string;
    displayOnProductPage: Boolean;
    status: string,
    name: string,
    createdAt: Date;
    updateAt: Date;
}

const vendorReview = new Schema<IVendorReview>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
        name: String,
        rating: { type: Number, default: 0 },
        message: String,
    
        displayOnProductPage: { type: Boolean, default: false },
        status: String,
    },
    { timestamps: true }
);

export const VendorReview = model<IVendorReview>("vendorReview", vendorReview);
