import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { State } from "../models/State.model";
import { string_to_slug } from "../helpers/stringify";
import { Country } from "../models/country.model";
export const addState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const StateNameCheck = await State.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
    }).exec();
    if (StateNameCheck) throw new Error("Entry Already exist please change brand name ");

    const newEntry = new State(req.body).save();

    if (!newEntry) {
      throw new Error("Unable to create State");
    }
    res.status(200).json({ message: "State Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getState = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let StateArr: any = [];
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
    let stateCount = await State.find(query).countDocuments();

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    StateArr = await State.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .sort({ name: 1 })
      .lean()
      .exec();
    // for (let state of StateArr) {
    //   if (state.countryId) {
    //     console.log(state.countryId, "countryIdcountryId")
    //     state.countryObj = await Country.findById(state.countryId).exec();
    //   }
    // }

    res.status(200).json({ message: "getState", data: StateArr, totalPages: stateCount, success: true });
  } catch (err) {
    next(err);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const StateObj = await State.findById(req.params.id).lean().exec();
    if (!StateObj) {
      throw new Error(" State not found");
    }

    await State.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "State Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const StateObj = await State.findByIdAndDelete(req.params.id).exec();
    if (!StateObj) throw { status: 400, message: "State Not Found" };
    res.status(200).json({ message: "State Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let StateObj: any = await State.findById(req.params.id).lean().exec();
    if (!StateObj) throw { status: 400, message: "State Not Found" };
    if (StateObj.countryId) {
      console.log(StateObj.countryId, "countryIdcountryId");
      StateObj.countryObj = await Country.findById(StateObj.countryId).exec();
    }
    res.status(200).json({ message: "State Found", data: StateObj, success: true });
  } catch (err) {
    next(err);
  }
};
