import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { BannerImage } from "../models/BannerImages.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { State } from "../models/State.model";
import { Product } from "../models/product.model";
export const createBannerImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, productId, userId, image, startDate, endDate } = req.body;

        // Check if the type is valid (either "profilebanner" or "productbanner")
        if (!type || (type !== "profilebanner" && type !== "productbanner")) {
            return res.status(400).json({ message: "Invalid banner type provided.", success: false });
        }

        // Handle base64 image upload if the image contains base64 data
        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = await storeFileAndReturnNameBase64(image); // Save the image and return the file name
        }

        // Create the new banner record directly without productSlug
        await new BannerImage({
            image: storedImage,
            startDate,
            endDate,
            userId: type === "profilebanner" ? userId : undefined,
            productId: type === "productbanner" ? productId : undefined,
        }).save();

        res.status(200).json({ message: "Banner image added successfully.", success: true });
    } catch (err) {
        next(err);
    }
};





