

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
        const { type, productId, userId, image, startDate, endDate, url } = req.body;

        // Check for existing banner image for the same product and user (except for Adminbanner)
        if (type !== "Adminbanner") {
            const BannerImageCheck = await BannerImage.findOne({
                productId: productId, userId: userId
            }).exec();
            if (BannerImageCheck) throw new Error("Entry already exists, cannot create new BannerImage. Please change product or dates to create one.");
        }

        // Validate the banner type
        if (!type || (type !== "profilebanner" && type !== "productbanner" && type !== "Adminbanner")) {
            return res.status(400).json({ message: "Invalid banner type provided.", success: false });
        }

        // Adminbanner doesn't need productId or userId checks
        let userObj: any;
        if (type !== "Adminbanner") {
            // Check if the user exists
            userObj = await User.findById(userId).exec();
            if (!userObj) {
                throw new Error("User not found!");
            }

            // Calculate date difference (if applicable to banner)
            let dateDiff = 0;
            if (startDate && endDate) {
                dateDiff = dateDifference(startDate, endDate);
            }

            // Check if the user has enough sale days to create this banner
            if (userObj.numberOfBannerImages - dateDiff <= 0) {
                throw new Error("You do not have enough banner sale days left in your account. Please reduce the duration of the banner or purchase a top-up.");
            }

            // Update user's saleDays and numberOfSales (if applicable)
            await User.findByIdAndUpdate(userObj._id, { $inc: { bannerimagesDays: -1, numberOfBannerImages: -dateDiff } }).exec();
        }

        // Handle base64 image upload if the image is base64 encoded
        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = await storeFileAndReturnNameBase64(image); // Save the image and return the file name
        }

        // Create the new banner record
        const newBanner = new BannerImage({
            image: storedImage,
            type: type,
            userId: userId || null, // Optional for Adminbanner
            productId: productId || null, // Optional for Adminbanner
            startDate: startDate || null, // If banner has startDate
            endDate: endDate || null,     // If banner has endDate
            url: type === "Adminbanner" ? url : null // Only include url if Adminbanner
        });

        await newBanner.save();

        res.status(200).json({ message: "Banner image added successfully.", success: true });
    } catch (err) {
        next(err);
    }
};

// Get all banner images
export const getAllBannerImagesverifeidonly = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bannerImages = await BannerImage.find({ isVerified: true }).populate({
            path: 'productId', // This assumes `productId` is the field in BannerImage model that references the Product model
            select: 'slug',    // Only return the `slug` field from the Product model
        }).populate({
            path: 'userId',       // Populate the userId field
            select: 'username email', // Select fields from User (modify as per your schema)
        });;
        res.status(200).json({ success: true, bannerImages });
    } catch (err) {
        next(err);
    }
};

export const getAllBannerImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bannerImages = await BannerImage.find().populate({
            path: 'productId', // This assumes `productId` is the field in BannerImage model that references the Product model
            select: 'slug',    // Only return the `slug` field from the Product model
        }).populate({
            path: 'userId',       // Populate the userId field
            select: 'username email', // Select fields from User (modify as per your schema)
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
export const getBannerImagesByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bannerImages = await BannerImage.find({ userId: req.params.userId })
            .populate({
                path: 'productId', // This assumes `productId` is the field in BannerImage model that references the Product model
                select: 'slug',    // Only return the `slug` field from the Product model
            });

        // Check if any banners were found
        if (!bannerImages.length) {
            return res.status(404).json({ message: "No banner images found for the given user.", success: false });
        }

        res.status(200).json({ success: true, bannerImages });
    } catch (err) {
        next(err);
    }
};

// Update a banner image by ID
export const updateBannerImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { type, productId, userId, image, isVerified } = req.body;

        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = await storeFileAndReturnNameBase64(image);
        }

        const updatedBannerImage = await BannerImage.findByIdAndUpdate(
            id,
            {
                image: storedImage,
                type: type,
                userId: userId,
                productId: productId,
                isVerified: isVerified, // Updating isVerified field

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



