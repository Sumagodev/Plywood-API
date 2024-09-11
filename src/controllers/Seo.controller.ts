import { NextFunction, Request, Response } from "express";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Seo } from "../models/seo.model";

export const addSeo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const FlashSaleCheck = await Seo.findOne({
            name: new RegExp(`${req.body.name}`, "i")
        }).exec();
        if (FlashSaleCheck) throw new Error("Entry Already exist, cannot create new Seo please change heading to create one ");
        if (req.body.image) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
          }
        const newEntry = new Seo(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Seo ");
        }
        res.status(200).json({ message: "Seo Successfully Created", success: true });
    } catch (err) {
        next(err);
    }
};
export const getSeo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let SeoArr: any = [];
        let query: any = {}


        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }

        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;

        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

        let SeoCount = await Seo.find(query).countDocuments();

        SeoArr = await Seo.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).exec();
        // for (let Seo of SeoArr) {
        //   if (Seo.SeoId) {
        //     console.log(Seo.SeoId, "SeoIdSeoId")
        //     Seo.SeoObj = await Seo.findById(Seo.SeoId).exec();
        //   }
        // }

        res.status(200).json({ message: "get Seo Subscription", data: SeoArr, SeoCount, success: true });
    } catch (err) {
        next(err);
    }
};



export const getSeoForHomepage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let SeoArr: any = [];

        SeoArr = await Seo.find().lean().exec();
        // for (let Seo of SeoArr) {
        //   if (Seo.SeoId) {
        //     console.log(Seo.SeoId, "SeoIdSeoId")
        //     Seo.SeoObj = await Seo.findById(Seo.SeoId).exec();
        //   }
        // }

        res.status(200).json({ message: "get Seo Subscription", data: SeoArr, success: true });
    } catch (err) {
        next(err);
    }
};




export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SeoObj = await Seo.findById(req.params.id).lean().exec();
        if (!SeoObj) {
            throw new Error("Seo Subscription not found");
        }
        let existsCheck = await Seo.findOne({ $and: [{ name: new RegExp(`^${req.body.name}%`, "i") }, { _id: { $ne: req.params.id } }] }).exec()
        console.log(existsCheck, "existsCheck")
        if (existsCheck) {
            throw new Error("Entry Already exist, cannot create new Seo please change heading to create one ");
        }
        if (req.body.image && `${req.body.image}`.includes('base64')) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
          }
      
        await Seo.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Seo Subscription Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SeoObj = await Seo.findByIdAndDelete(req.params.id).exec();
        if (!SeoObj) throw { status: 400, message: "Seo Subscription Not Found" };
        res.status(200).json({ message: "Seo Subscription Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let SeoObj: any = await Seo.findById(req.params.id).lean().exec();
        if (!SeoObj) throw { status: 400, message: "Seo Subscription Not Found" };
        res.status(200).json({ message: "Seo Subscription Found", data: SeoObj, success: true });
    } catch (err) {
        next(err);
    }
};
