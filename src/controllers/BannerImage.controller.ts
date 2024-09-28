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
        const { type, productId, userId, image } = req.body;

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
            type: type,
            userId: type === "profilebanner" ? userId : undefined,
            productId: type === "productbanner" ? productId : undefined,
        }).save();

        res.status(200).json({ message: "Banner image added successfully.", success: true });
    } catch (err) {
        next(err);
    }
};

// Get all banner images
export const getAllBannerImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bannerImages = await BannerImage.find().populate({
            path: 'productId', // This assumes `productId` is the field in BannerImage model that references the Product model
            select: 'slug',    // Only return the `slug` field from the Product model
        });;
        res.status(200).json({ success: true, bannerImages });
    } catch (err) {
        next(err);
    }
};

// Get a single banner image by ID
export const getBannerImageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const bannerImage = await BannerImage.findById(id).populate({
            path: 'productId', // This assumes `productId` is the field in BannerImage model that references the Product model
            select: 'slug',    // Only return the `slug` field from the Product model
        });;
        if (!bannerImage) {
            return res.status(404).json({ message: "Banner image not found.", success: false });
        }
        res.status(200).json({ success: true, bannerImage });
    } catch (err) {
        next(err);
    }
};

// Update a banner image by ID
export const updateBannerImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { type, productId, userId, image } = req.body;

        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = await storeFileAndReturnNameBase64(image);
        }

        const updatedBannerImage = await BannerImage.findByIdAndUpdate(
            id,
            {
                image: storedImage,

                userId: type === "profilebanner" ? userId : undefined,
                productId: type === "productbanner" ? productId : undefined,
            },
            { new: true } // Return the updated document
        );

        if (!updatedBannerImage) {
            return res.status(404).json({ message: "Banner image not found.", success: false });
        }

        res.status(200).json({ message: "Banner image updated successfully.", success: true, updatedBannerImage });
    } catch (err) {
        next(err);
    }


    
};

// Delete a banner image by ID
export const deleteBannerImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const bannerImage = await BannerImage.findByIdAndDelete(id);
        if (!bannerImage) {
            return res.status(404).json({ message: "Banner image not found.", success: false });
        }
        res.status(200).json({ message: "Banner image deleted successfully.", success: true });
    } catch (err) {
        next(err);
    }
};



