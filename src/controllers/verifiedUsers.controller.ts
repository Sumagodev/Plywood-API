import { NextFunction, Request, Response } from "express";
import VerifiedUsers from "../models/VerifiedUser.model";
import { ValidatePhone } from "../helpers/validiator";
import { postSpiCrmLead } from "../service/sipCrm.service";

export const addVerifiedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, phone } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required", success: false });
    }

    if (!ValidatePhone(phone)) {
      throw new Error("Phone number is not valid!");
    }

    const userRequestObj = await new VerifiedUsers(req.body).save();

    const crmObj = {
      status: userRequestObj?.status,
      MobileNo: userRequestObj?.phone,
      verifiedAt: userRequestObj?.verifiedAt,
    };

    await postSpiCrmLead(crmObj);

    res.status(200).json({ message: "VerifiedUser successfully created", success: true });
  } catch (err) {
    next(err);
  }
};

export const getVerifiedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {};
    const totalCounts = await VerifiedUsers.find(query).countDocuments();
    
    const pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
    const totalPages = Math.ceil(totalCounts / limitValue);

    const userRequestArr = await VerifiedUsers.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .lean()
      .exec();

    res.status(200).json({
      message: "Verified users fetched successfully",
      data: userRequestArr,
      totalCounts,
      page: pageValue,
      limit: limitValue,
      totalPages,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRequestObj = await VerifiedUsers.findById(req.params.id).exec();
    if (!userRequestObj) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const updatedUser = await VerifiedUsers.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();

    res.status(200).json({ message: "User updated successfully", data: updatedUser, success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedUser = await VerifiedUsers.findByIdAndDelete(req.params.id).exec();
    if (!deletedUser) {
      return res.status(404).json({ message: "VerifiedUser not found", success: false });
    }

    res.status(200).json({ message: "VerifiedUser deleted", success: true });
  } catch (err) {
    next(err);
  }
};
