import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Advertisement } from "../models/AdvertisementSubscription.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { Product } from "../models/product.model";
import {DealershipOwner} from "../models/adddealership.model"
import { DealershipApplication } from "../models/applyfordealership.model";
import mongoose from "mongoose";

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { dealershipOwnerId, productId, userId } = req.body;

        // Validate dealershipOwnerId
        if (!mongoose.Types.ObjectId.isValid(dealershipOwnerId)) {
            return res.status(400).json({ message: "Invalid DealershipOwner ID" });
        }
        const dealershipOwnerExists = await DealershipOwner.findById(dealershipOwnerId).exec();
        if (!dealershipOwnerExists) {
            return res.status(404).json({ message: "Dealership Owner not found" });
        }

        // Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }
        const productExists = await Product.findById(productId).exec();
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const userExists = await User.findById(userId).exec();
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        // If validation passes, proceed to save the application
        const newApplication = new DealershipApplication(req.body);
        const savedApplication = await newApplication.save();
        res.status(201).json({ message: "Application Submitted Successfully", data: savedApplication });
    } catch (error) {
        next(error);
    }
};

// Get all applications (optional: filter by dealershipOwnerId or userId)
export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applications = await DealershipApplication.find(req.query).populate('dealershipOwnerId').populate('userId').exec();
        res.status(200).json({ data: applications });
    } catch (error) {
        next(error);
    }
};

// Get a single application by ID
export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const application = await DealershipApplication.findById(req.params.id).populate('dealershipOwnerId').populate('userId').exec();
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ data: application });
    } catch (error) {
        next(error);
    }
};

// Update an application (e.g., change status)
export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedApplication = await DealershipApplication.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ message: "Application Updated Successfully", data: updatedApplication });
    } catch (error) {
        next(error);
    }
};

// Delete an application
export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedApplication = await DealershipApplication.findByIdAndDelete(req.params.id).exec();
        if (!deletedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ message: "Application Deleted Successfully" });
    } catch (error) {
        next(error);
    }
};
