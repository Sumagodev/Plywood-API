import mongoose, { model, Schema, Types } from "mongoose";

export interface IProductReview {
    userId: string;
    rating: number;
    message: string;
    productId: Types.ObjectId | any;
    displayOnProductPage: Boolean;
    status: string,
    name: string,
    createdAt: Date;
    updateAt: Date;
}

const productReview = new Schema<IProductReview>(
    {
        userId: String,
        name: String,
        rating: { type: Number, default: 0 },
        message: String,
        productId: {
            type: Schema.Types.ObjectId,
            ref: "product",
        },
        displayOnProductPage: { type: Boolean, default: false },
        status: String,
    },
    { timestamps: true }
);

export const ProductReview = model<IProductReview>("productReview", productReview);
