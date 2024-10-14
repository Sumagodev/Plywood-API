import { model, Schema, Types } from "mongoose";

export interface IPayment{
    paymentId: string;
    userId: Types.ObjectId | any;
    gatwayPaymentObj:  any;
    orderObj:  any;
    paymentChk:number;
    amount:number;
    gatewayPaymentArr:any,
    statusResponse:any,
    createdAt: Date;
    updateAt: Date;
}

const payment = new Schema<IPayment>(
    {
        paymentId: String,
        amount: String,
        gatwayPaymentObj: Object, // razorpay
        orderObj: Object, // razorpay
        paymentChk: {
            // 0 means payment has not occured ,1 means payment successful, -1 means payment failed ,2 for cod,3,partial paid,4,paid by other
            type: Number, //  this will also be 1 if the payableamount is 0
            default: 0, // if payment is not 1 then it wont be able to proceed
        },
        gatewayPaymentArr: Array,
        statusResponse: Object,
    },
    { timestamps: true }
);

export const Payment = model<IPayment>("payment", payment);
