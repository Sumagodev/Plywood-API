import { NextFunction, Request, Response } from "express";
import { quickenquiry } from "../models/quickenquiry.model";
import { ValidatePhone } from "../helpers/validiator";
import { postSpiCrmLead } from "../service/sipCrm.service";
export const addquickenquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.userId) {
    }

    if (!ValidatePhone(req.body.phone)) {
      throw new Error("Phone number is not valid !!!!");
    }

    let userRequestObj = await new quickenquiry(req.body).save();

    let crmObj = {
      PersonName: userRequestObj?.name,
      MobileNo: userRequestObj?.phone,
      OfficeAddress: `${userRequestObj?.meassage}`,

    };

  
    await postSpiCrmLead(crmObj);
    res.status(200).json({ message: " quickenquiry Sucessfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getquickenquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userRequestArr: any = [];
    let query: any = {};


    let totalCounts = await quickenquiry.find(query).countDocuments();

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    userRequestArr = await quickenquiry.find(query)
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
    let userRequestObj = await quickenquiry.findById(req.params.id).exec();
    if (!userRequestObj) {
      throw new Error("User Request not found");
    }

    await quickenquiry.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "State Found", data: userRequestObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const TopupObj = await quickenquiry.findByIdAndDelete(req.params.id).exec();
    if (!TopupObj) throw { status: 400, message: "quickenquiry Not Found" };
    res.status(200).json({ message: "quickenquiry Deleted", success: true });
  } catch (err) {
    next(err);
  }
};
