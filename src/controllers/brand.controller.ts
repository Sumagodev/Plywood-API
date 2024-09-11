import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Brand } from "../models/brand.model";
import { string_to_slug } from "../helpers/stringify"
export const addBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const BrandNameCheck = await Brand.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
    }).exec();
    if (BrandNameCheck) throw new Error("Entry Already exist please change brand name ");
    let obj = {};
    if (req.body.image) {
      req.body.image = await storeFileAndReturnNameBase64(req.body.image);
    }
    if (req.body.name) {
      req.body.slug = await string_to_slug(req.body.name)
    }

    const newEntry = new Brand(req.body).save();

    if (!newEntry) {
      throw new Error("Unable to create Brand");
    }
    res.status(200).json({ message: "Brand Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let BrandArr: any = [];
    let query: any = {}

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, 'i') }
    }


    let brandCount = await Brand.find(query).countDocuments()


    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    BrandArr = await Brand.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();

    res.status(200).json({ message: "getBrand", data: BrandArr, brandCount, success: true });
  } catch (err) {
    next(err);
  }
};



export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BrandObj = await Brand.findById(req.params.id).lean().exec();
    if (!BrandObj) {
      throw new Error(" Brand not found");
    }
    if (req.body.image && `${req.body.image}`.includes('base64')) {
      req.body.image = await storeFileAndReturnNameBase64(req.body.image);
    }



    await Brand.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "Brand Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BrandObj = await Brand.findByIdAndDelete(req.params.id).exec();
    if (!BrandObj) throw { status: 400, message: "Brand Not Found" };
    res.status(200).json({ message: "Brand Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const BrandObj = await Brand.findById(req.params.id).exec();
    if (!BrandObj) throw { status: 400, message: "Brand Not Found" };

    res.status(200).json({ message: "Brand Found", data: BrandObj, success: true });
  } catch (err) {
    next(err);
  }
};
