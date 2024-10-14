import { model, Schema, Types } from "mongoose";

export interface IPaymentWebhook{
    payload:any
}

const webhook = new Schema<IPaymentWebhook>(
    {
        payload: Object,
    },
    { timestamps: true }
);

export const PaymentWebhook = model<IPaymentWebhook>("PaymentWebhook", webhook);
