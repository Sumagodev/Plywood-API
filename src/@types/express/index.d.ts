import express from "express";
import { Types } from "mongoose";
import { IUser } from "../../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: Types.ObjectId | string;
        role: string;
        user: {
          name: string;
          email: string;
          phone: string;
          _id: Types.ObjectId | string;
        };
        userObj?: IUser | undefined | null;
      };
    }
  }
}
