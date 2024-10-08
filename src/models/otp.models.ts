import mongoose, { Document, Schema } from 'mongoose';
import { SendSms } from '../helpers/sms';

interface OTP extends Document {
  phone: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<OTP>({
phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

// Define a function to send emails
async function sendVerificationSMS(phone: string, otp: string): Promise<void> {
  try {
  
    await SendSms(phone,otp);

  } catch (error) {
    console.log("Error occurred while sending phone: ", error);
    throw error;
  }
}

otpSchema.pre<OTP>('save', async function (this: OTP, next) {
  console.log("New document saved to the database");
  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationSMS(this.phone, this.otp);
  }
  next();
});

export default mongoose.model<OTP>('OTP', otpSchema);
