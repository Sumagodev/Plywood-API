import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../helpers/config";
import { User } from "../models/user.model";

export const authorizeJwt = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.headers)
  const authorization = req.headers["authorization"];
  const token = authorization && authorization.split("Bearer ")[1];
  if (!token) return res.status(401).json({ message: "Invalid Token" });
  try {
    // Verify token
    const decoded: any = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET);
    // Add user from payload
    req.user = decoded;

    if (req.user) {
      const userObj = await User.findById(decoded.userId).exec();
      if (userObj) {
        req.user.userObj = userObj;
      }
    }

    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const setUserAndUserObj = async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.headers);
  const authorization = req.headers["authorization"];
  if (authorization) {
    const token = authorization && authorization.split("Bearer ")[1];
    if (token) {
      try {
        // Verify token
        const decoded: any = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET);
        // Add user from payload
        if (decoded) {
          req.user = decoded;
        }

        if (req.user) {
          req.user.userObj = await User.findById(decoded.userId).exec();
        }
      } catch (e) {
        console.error(e);
        // return res.status(401).json({ message: "Invalid Token" });
      }
    }
  }
  next();
};
