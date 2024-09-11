import { NextFunction, Request, Response } from "express";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { HomepageBanners } from "../models/homepageBanners.model";

export const CreateHomepageBanners = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (req.body.image && req.body.image.includes("base64")) {
            let temp = await storeFileAndReturnNameBase64(req.body.image)
            await new HomepageBanners({ image: temp }).save();
            res.status(200).json({ message: "Added", success: true });
        }

    } catch (err) {
        next(err);
    }
};


export const UpdateHomepageBanners = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let existsCheck = await HomepageBanners.findById(req.params.id).exec();


        if (!existsCheck) {
            throw new Error("Banner not available or deleted by someone else");
        }

        if (req.body.image && req.body.image.includes("base64")) {
            let temp = await storeFileAndReturnNameBase64(req.body.image)
            await HomepageBanners.findByIdAndUpdate(req.params.id, { image: temp }).exec();
            res.status(200).json({ message: "Updated", success: true });
        }



    } catch (err) {
        next(err);
    }
};

export const getHomepageBanners = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let query: any = {}


        if (req.query.q) {
            query = { ...query, name: new RegExp(`${req.query.q}`, 'i') }
        }


        let totalCount = await HomepageBanners.find(query).countDocuments()


        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;


        let HomepageBannersArr: any = [];
        HomepageBannersArr = await HomepageBanners.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();

        // let HomepageBannersArr = await HomepageBanners.find({}).exec();

        console.log(HomepageBannersArr, "HomepageBannersArr")
        res.status(200).json({ message: "getUserTicket", data: HomepageBannersArr, totalCount, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    } catch (err) {
        next(err);
    }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const HomepageBannersObj = await HomepageBanners.findByIdAndDelete(req.params.id).exec();
        if (!HomepageBannersObj) throw { status: 400, message: "HomepageBanners Not Found" };
        res.status(200).json({ message: "HomepageBanners Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let HomepageBannerssObj: any = await HomepageBanners.findOne({ _id: req.params.id }).lean().exec();
        if (!HomepageBannerssObj) throw { status: 400, message: "Homepage Banner Not Found" };
        res.status(200).json({ message: "HomepageBanner Found", data: HomepageBannerssObj, success: true });
    } catch (err) {
        next(err);
    }
};
