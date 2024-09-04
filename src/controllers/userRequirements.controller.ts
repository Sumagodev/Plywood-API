import { NextFunction, Request, Response } from "express";
import { UserRequirement } from "../models/userRequirement.model";
import { ValidatePhone } from "../helpers/validiator";
import { postSpiCrmLead } from "../service/sipCrm.service";
export const addUserRequirement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.userId) {
    }

    if (!ValidatePhone(req.body.phone)) {
      throw new Error("Phone number is not valid !!!!");
    }

    let userRequestObj = await new UserRequirement(req.body).save();

    let crmObj = {
      PersonName: userRequestObj?.name,
      MobileNo: userRequestObj?.phone,
      OfficeAddress: `${userRequestObj?.address}`,
      MediumName: "Requirements ",
      InitialRemarks: `${userRequestObj?.productName}`,
      SourceName: "app",
    };

    if (req.body?.SourceName) {
      crmObj.SourceName = req.body?.SourceName;
    }
    await postSpiCrmLead(crmObj);
    res.status(200).json({ message: "User Requirement Sucessfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getUserRequirement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userRequestArr: any = [];
    let query: any = {};

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.countryId) {
      query.countryId = req.query.countryId;
    }

    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
    }

    let totalCounts = await UserRequirement.find(query).countDocuments();

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    userRequestArr = await UserRequirement.find(query)
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
    let userRequestObj = await UserRequirement.findById(req.params.id).exec();
    if (!userRequestObj) {
      throw new Error("User Request not found");
    }

    await UserRequirement.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "State Found", data: userRequestObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const TopupObj = await UserRequirement.findByIdAndDelete(req.params.id).exec();
    if (!TopupObj) throw { status: 400, message: "UserRequirement Not Found" };
    res.status(200).json({ message: "UserRequirement Deleted", success: true });
  } catch (err) {
    next(err);
  }
};
