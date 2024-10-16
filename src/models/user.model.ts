import mongoose, { Schema, Types, Document, model } from "mongoose";
import { ROLES } from "../helpers/constant";

// 1. Create an interface representing a document in MongoDB.
export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  whatsapp: String;
  role: string;
  aniversaryDate: Date,
  landline: String,
  profileCount:Number;
  dob: String,
  firmName: String;
  gstNumber: String;
  numberOfSales: Number,
  brandNames: string,
  saleDays: Number,
  numberOfAdvertisement: Number,
  advertisementDays: Number,
  numberOfBannerImages: Number,
  bannerimagesDays: Number,
  numberOfOpportunities: Number,
  OpportunitiesDays: Number,
  address: String;
  countryId: String;
  stateId: String;
  cityId: String;
  token: String;
  isBlocked: Boolean,
  salesId: Types.ObjectId,
  categoryArr: [
    {
      categoryId: mongoose.Types.ObjectId,
    }
  ],
  profileImage: String;
  bannerImage: String;
  subscriptionEndDate: Date,
  documents: [
    {
      fileName: string;
    }
  ];
  approved: boolean;
  accessObj: {
    manageUsers: boolean;
    manageCategory: boolean;
  };
  isVerified: boolean;
  rating: Number,
  companyObj: {
    name: String;
    phone: String;
    email: String;
    address: String;
    noofepmployee: String;
    natureOfBusiness: String;
    annualTurnover: String;
    iecCode: String;
    yearOfEstablishment: String;
    legalStatus: String;
    cinNo: String;
    companyCeo: String;
    gstNumber: String;
    googleMapsLink: String;
  };
  imagesArr: [
    {
      image: String
    }
  ],
  videoArr: [
    {
      video: String
    }
  ],
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
  {
    name: String,
    email: String,
    phone: String,
    whatsapp: String,
    password: String,
    aniversaryDate: Date,
    landline: String,
    address: String,
    dob: String,
    countryId: String,
    stateId: String,
    brandNames: String,
    cityId: String,
    token: String,
    salesId: Types.ObjectId,
    profileImage: String,
    bannerImage: String,
    isBlocked: { default: false, type: Boolean },
    profileCount:{ type: Number, default: 0 },
    subscriptionEndDate: Date,
    categoryArr: [
      {
        categoryId: mongoose.Types.ObjectId,
      }
    ],
    companyObj: {
      name: String,
      phone: String,
      email: String,
      address: String,
      noofepmployee: String,
      natureOfBusiness: String,
      annualTurnover: String,
      iecCode: String,
      yearOfEstablishment: String,
      legalStatus: String,
      cinNo: String,
      companyCeo: String,
      googleMapsLink: String,
      gstNumber: String,
    },
    imagesArr: [
      {
        image: String
      }
    ],
    videoArr: [
      {
        video: String
      }
    ],
    role: {
      type: String,
      default: ROLES.USER,
    },
    approved: {
      type: Boolean,
      default: true,
    },
    accessObj: {
      manageUsers: {
        type: Boolean,
        default: false,
      },
      manageCategory: {
        type: Boolean,
        default: false,
      },
    },
    documents: [
      {
        name: String,
        image: String,
      },
    ],
    // And `Schema.Types.ObjectId` in the schema definition.
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numberOfSales: { type: Number, default: 0 },
    saleDays: { type: Number, default: 0 },
    numberOfBannerImages: { type: Number, default: 0 },
    bannerimagesDays: { type: Number, default: 0 },
    numberOfOpportunities: { type: Number, default: 0 },
    OpportunitiesDays: { type: Number, default: 0 },
    numberOfAdvertisement: { type: Number, default: 0 },
    advertisementDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
