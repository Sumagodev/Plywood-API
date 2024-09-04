import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Blogs } from "../models/Blog.model";
import { User } from "../models/user.model";
export const addBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const BlogsCheck = await Blogs.findOne({
            name: new RegExp(`${req.body.name}`, "i")
        }).exec();
        if (BlogsCheck) throw new Error("Entry Already exist, cannot create new Blogs please change heading to create one ");

        if (req.body.image) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
        }
        const newEntry = new Blogs(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create Blogs Subscription");
        }
        res.status(200).json({ message: "Blogs Successfully Created", success: true });
    } catch (err) {
        next(err);
    }
};
export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let BlogsArr: any = [];
        let query: any = {}


        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }

        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;

        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

        let BlogsCount = await Blogs.find(query).countDocuments();

        BlogsArr = await Blogs.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).exec();
        // for (let Blogs of BlogsArr) {
        //   if (Blogs.BlogsId) {
        //     console.log(Blogs.BlogsId, "BlogsIdBlogsId")
        //     Blogs.BlogsObj = await Blogs.findById(Blogs.BlogsId).exec();
        //   }
        // }

        res.status(200).json({ message: "get Blogs Subscription", data: BlogsArr, BlogsCount, success: true });
    } catch (err) {
        next(err);
    }
};



export const getBlogsForHomepage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let BlogsArr: any = [];
        let query: any = {}
        let today = new Date();
        today.setHours(23, 59, 59, 59);
        console.log(req.query, "req.query.q")
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }

        BlogsArr = await Blogs.find().lean().exec();
        // for (let Blogs of BlogsArr) {
        //   if (Blogs.BlogsId) {
        //     console.log(Blogs.BlogsId, "BlogsIdBlogsId")
        //     Blogs.BlogsObj = await Blogs.findById(Blogs.BlogsId).exec();
        //   }
        // }

        res.status(200).json({ message: "get Blogs Subscription", data: BlogsArr, success: true });
    } catch (err) {
        next(err);
    }
};




export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const BlogsObj = await Blogs.findById(req.params.id).lean().exec();
        if (!BlogsObj) {
            throw new Error("Blogs Subscription not found");
        }
        let existsCheck = await Blogs.findOne({ $and: [{ name: new RegExp(`^${req.body.name}%`, "i") }, { _id: { $ne: req.params.id } }] }).exec()
        console.log(existsCheck, "existsCheck")
        if (existsCheck) {
            throw new Error("Entry Already exist, cannot create new Blogs please change heading to create one ");
        }
        if (req.body.image && req.body.image.includes("base64")) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
        }
        await Blogs.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Blogs Subscription Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const BlogsObj = await Blogs.findByIdAndDelete(req.params.id).exec();
        if (!BlogsObj) throw { status: 400, message: "Blogs Subscription Not Found" };
        res.status(200).json({ message: "Blogs Subscription Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let BlogsObj: any = await Blogs.findById(req.params.id).lean().exec();
        if (!BlogsObj) throw { status: 400, message: "Blogs Subscription Not Found" };
        res.status(200).json({ message: "Blogs Subscription Found", data: BlogsObj, success: true });
    } catch (err) {
        next(err);
    }
};
