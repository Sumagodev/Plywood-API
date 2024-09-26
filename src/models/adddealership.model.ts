import mongoose, { Schema, Types, Document, model } from "mongoose";

// Define the interface for your document
export interface Idealer extends Document {
  Organisation_name: string;
  Type: string;
  Product: string;
  Brand: string;
  productId?: Types.ObjectId; // Optional if not always provided
  email: String;
  categoryArr:string[],
  userId: Types.ObjectId;
  image?: string;
  countryId?: string;
  stateId?: string;
  cityId: string[]; // Updated to be an array of strings
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema with cityId as an array
const dealershipOwnerSchema = new Schema<Idealer>(
  {
    Organisation_name: { type: String, required: true },
    Type: { type: String, required: true },
    Product: { type: String },
    Brand: { type: String, required: true },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    email: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryArr: [{ type: String }],
    image: { type: String },
    countryId: { type: String },
    stateId: { type: String },
    cityId: [{ type: String }], // Define cityId as an array of strings
  },
  { timestamps: true }
);

// Ensure the model is not redefined
export const DealershipOwner = mongoose.models.DealershipOwner || model<Idealer>("DealershipOwner", dealershipOwnerSchema);
