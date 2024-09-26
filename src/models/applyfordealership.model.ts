import mongoose, { Schema, Types, Document, model } from "mongoose";

// Define the interface for your document
export interface Idealer extends Document {
  Organisation_name: string;
  dealershipOwnerId: mongoose.Types.ObjectId;
  Type: string;
  Brand: string;
  productId?: Types.ObjectId; // Optional if not always provided
  userId: Types.ObjectId;
  categoryArr:string[],
  image?: string;
  countryId?: string;
  email?: string;
  stateId?: string;
  cityId: string[]; // Updated to be an array of strings
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema with cityId as an array
const dealershipApplicationSchema = new Schema<Idealer>(
  {
    Organisation_name: { type: String, required: true },
    Type: { type: String, required: true },
    Brand: { type: String, required: true },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false, // Set to false if optional
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dealershipOwnerId: {
      type: Schema.Types.ObjectId,
      ref: 'DealershipOwner',
      required: true,
    },
    categoryArr: [{ type: String }],
    image: { type: String },
    countryId: { type: String },
    stateId: { type: String },
    email: { type: String },
    cityId: [{ type: String }], // Array of strings
  },
  { timestamps: true }
);

// Correct model export
export const DealershipApplication = mongoose.models.DealershipApplication || model<Idealer>("DealershipApplication", dealershipApplicationSchema);
