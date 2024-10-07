import { NextFunction, Request, Response } from "express";
import VerifiedUsers from "../models/VerifiedUser.model";
import { ValidatePhone } from "../helpers/validiator";
import { postSpiCrmLead } from "../service/sipCrm.service";
export const addVerifiedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.userId) {
    }

    if (!ValidatePhone(req.body.phone)) {
      throw new Error("Phone number is not valid !!!!");
    }

    let userRequestObj = await new VerifiedUsers(req.body).save();

    let crmObj = {
      status: userRequestObj?.status,
      MobileNo: userRequestObj?.phone,
      verifiedAt : userRequestObj?.verifiedAt

    };


    await postSpiCrmLead(crmObj);
    res.status(200).json({ message: " VerifiedUser Sucessfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getVerifiedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userRequestArr: any = [];
    let query: any = {};


    let totalCounts = await VerifiedUsers.find(query).countDocuments();

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    userRequestArr = await VerifiedUsers.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .lean()
      .exec();

    res.status(200).json({ message: "getState", data: userRequestArr, totalCounts: totalCounts, success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userRequestObj = await VerifiedUsers.findById(req.params.id).exec();
    if (!userRequestObj) {
      throw new Error("User Request not found");
    }

    await VerifiedUsers.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "State Found", data: userRequestObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const TopupObj = await VerifiedUsers.findByIdAndDelete(req.params.id).exec();
    if (!TopupObj) throw { status: 400, message: "VerifiedUser Not Found" };
    res.status(200).json({ message: "VerifiedUser Deleted", success: true });
  } catch (err) {
    next(err);
  }
};
