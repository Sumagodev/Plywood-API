import { NextFunction, Request, Response } from "express";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { WebsiteData } from "../models/websitedata.model";

export const CreateWebsiteData = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let existsCheck = await WebsiteData.findOne({}).exec();


        if (existsCheck) {
            if (req.body.image && req.body.image.includes("base64")) {
                let temp = await storeFileAndReturnNameBase64(req.body.image)
                await WebsiteData.findOneAndUpdate({}, { shopImage: temp }).exec();
                res.status(200).json({ message: "Updated", success: true });
            }
        }
        else {
            if (req.body.image && req.body.image.includes("base64")) {
                let temp = await storeFileAndReturnNameBase64(req.body.image)
                await new WebsiteData({ shopImage: temp }).save();
                res.status(200).json({ message: "Added", success: true });
            }
        }

    } catch (err) {
        next(err);
    }
};

export const getWebsiteData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let websiteDataObj = await WebsiteData.findOne({}).exec();

        console.log(websiteDataObj, "websiteDataObj")
        res.status(200).json({ message: "getUserTicket", data: websiteDataObj, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    } catch (err) {
        next(err);
    }
};