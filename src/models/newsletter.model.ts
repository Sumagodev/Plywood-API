import { model, Schema } from "mongoose";

export interface INewsLetter {
    email: string;
    createdAt: Date;
    updateAt: Date;
}

const newsLetter = new Schema<INewsLetter>(
    {
        email: String,
    },
    { timestamps: true }
);

export const NewsLetter = model<INewsLetter>("newsLetter", newsLetter);
