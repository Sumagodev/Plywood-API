import { NextFunction, Request, Response } from "express";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { BlogVideos as BlogVideo } from "../models/BlogVideos.model";
export const addBlogVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const FlashSaleCheck = await BlogVideo.findOne({
            name: new RegExp(`${req.body.name}`, "i")
        }).exec();
        if (FlashSaleCheck) throw new Error("Entry Already exist, cannot create new BlogVideo please change heading to create one ");

        const newEntry = new BlogVideo(req.body).save();
        if (!newEntry) {
            throw new Error("Unable to create BlogVideo Subscription");
        }
        res.status(200).json({ message: "BlogVideo Successfully Created", success: true });
    } catch (err) {
        next(err);
    }
};
export const getBlogVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let BlogVideoArr: any = [];
        let query: any = {}


        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }

        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;

        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

        let BlogVideoCount = await BlogVideo.find(query).countDocuments();

        BlogVideoArr = await BlogVideo.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).exec();
        // for (let BlogVideo of BlogVideoArr) {
        //   if (BlogVideo.BlogVideoId) {
        //     console.log(BlogVideo.BlogVideoId, "BlogVideoIdBlogVideoId")
        //     BlogVideo.BlogVideoObj = await BlogVideo.findById(BlogVideo.BlogVideoId).exec();
        //   }
        // }

        res.status(200).json({ message: "get BlogVideo Subscription", data: BlogVideoArr, BlogVideoCount, success: true });
    } catch (err) {
        next(err);
    }
};



export const getBlogVideoForHomepage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let BlogVideoArr: any = [];
        let query: any = {}
        let today = new Date();
        today.setHours(23, 59, 59, 59);
        console.log(req.query, "req.query.q")
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }

        BlogVideoArr = await BlogVideo.find().lean().exec();
        // for (let BlogVideo of BlogVideoArr) {
        //   if (BlogVideo.BlogVideoId) {
        //     console.log(BlogVideo.BlogVideoId, "BlogVideoIdBlogVideoId")
        //     BlogVideo.BlogVideoObj = await BlogVideo.findById(BlogVideo.BlogVideoId).exec();
        //   }
        // }

        res.status(200).json({ message: "get BlogVideo Subscription", data: BlogVideoArr, success: true });
    } catch (err) {
        next(err);
    }
};




export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const BlogVideoObj = await BlogVideo.findById(req.params.id).lean().exec();
        if (!BlogVideoObj) {
            throw new Error("BlogVideo Subscription not found");
        }
        let existsCheck = await BlogVideo.findOne({ $and: [{ name: new RegExp(`^${req.body.name}%`, "i") }, { _id: { $ne: req.params.id } }] }).exec()
        console.log(existsCheck, "existsCheck")
        if (existsCheck) {
            throw new Error("Entry Already exist, cannot create new BlogVideo please change heading to create one ");
        }
        await BlogVideo.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "BlogVideo Subscription Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const BlogVideoObj = await BlogVideo.findByIdAndDelete(req.params.id).exec();
        if (!BlogVideoObj) throw { status: 400, message: "BlogVideo Subscription Not Found" };
        res.status(200).json({ message: "BlogVideo Subscription Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let BlogVideoObj: any = await BlogVideo.findById(req.params.id).lean().exec();
        if (!BlogVideoObj) throw { status: 400, message: "BlogVideo Subscription Not Found" };
        res.status(200).json({ message: "BlogVideo Subscription Found", data: BlogVideoObj, success: true });
    } catch (err) {
        next(err);
    }
};
