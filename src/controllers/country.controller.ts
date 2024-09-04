import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Country } from "../models/country.model"
import { string_to_slug } from "../helpers/stringify"
export const addCountry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const CountryNameCheck = await Country.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
    }).exec();
    if (CountryNameCheck) throw new Error("Entry Already exist please change brand name ");

    const newEntry = new Country(req.body).save();

    if (!newEntry) {
      throw new Error("Unable to create Country");
    }
    res.status(200).json({ message: "Country Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getCountry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let CountryArr: any = [];
    let query: any = {}
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, 'i') }
    }
    let countryCount = await Country.find(query).countDocuments()

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    CountryArr = await Country.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();

    res.status(200).json({ message: "getCountry", data: CountryArr, countryCount: countryCount, success: true });
  } catch (err) {
    next(err);
  }
};



export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const CountryObj = await Country.findById(req.params.id).lean().exec();
    if (!CountryObj) {
      throw new Error(" Country not found");
    }


    await Country.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "Country Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const CountryObj = await Country.findByIdAndDelete(req.params.id).exec();
    if (!CountryObj) throw { status: 400, message: "Country Not Found" };
    res.status(200).json({ message: "Country Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const CountryObj = await Country.findById(req.params.id).exec();
    if (!CountryObj) throw { status: 400, message: "Country Not Found" };

    res.status(200).json({ message: "Country Found", data: CountryObj, success: true });
  } catch (err) {
    next(err);
  }
};
