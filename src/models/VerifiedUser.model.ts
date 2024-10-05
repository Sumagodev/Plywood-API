import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Phone Verification model
interface VerifiedUsers extends Document {
  phone: string;
  verifiedAt: Date;
  status: boolean; // true for verified, false for not verified
}

// Create the schema for the Phone Verification model
const VerifiedUsersSchema: Schema = new Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/, // Ensures the phone number format is valid
  },
  verifiedAt: {
    type: Date,
    default: Date.now, // Sets the default to the current date/time
  },
  status: {
    type: Boolean,
    default: false, // Set default to false until verified
  },
});

// Create the model from the schema
const VerifiedUsers = mongoose.model<VerifiedUsers>('VerifiedUsers', VerifiedUsersSchema);

export default VerifiedUsers;
