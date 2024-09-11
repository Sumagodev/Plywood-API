import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Advertisement } from "../models/AdvertisementSubscription.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { Product } from "../models/product.model";
import { DealershipOwner } from "../models/adddealership.model";
import mongoose from "mongoose";
// Create a new dealership owner (linked to an existing user)
export const createDealershipOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if the user exists
        const user = await User.findById(req.body.userId).exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Handle image upload if provided
        if (req.body.image) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
        }

        // Create a new dealership owner entry
        const newOwner = new DealershipOwner(req.body);
        const savedOwner = await newOwner.save();

        res.status(201).json({ message: "Dealership Owner Created Successfully", data: savedOwner });
    } catch (error) {
        next(error);
    }
};
// Get all dealership owners
export const getAllDealershipOwners = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const owners = await DealershipOwner.find().populate("userId").exec();
        res.status(200).json({ data: owners });
    } catch (error) {
        next(error);
    }
};

// Get a single dealership owner by ID
export const getDealershipOwnerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const owner = await DealershipOwner.findById(id).populate("userId").exec();

        if (!owner) {
            return res.status(404).json({ message: "Dealership Owner Not Found" });
        }

        res.status(200).json({ data: owner });
    } catch (error) {
        next(error);
    }
};

// Update a dealership owner by ID
export const updateDealershipOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const owner = await DealershipOwner.findById(id).exec();
        if (!owner) {
            return res.status(404).json({ message: "Dealership Owner Not Found" });
        }

        const updatedOwner = await DealershipOwner.findByIdAndUpdate(id, req.body, { new: true }).exec();

        res.status(200).json({ message: "Dealership Owner Updated Successfully", data: updatedOwner });
    } catch (error) {
        next(error);
    }
};

// Delete a dealership owner by ID
export const deleteDealershipOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const deletedOwner = await DealershipOwner.findByIdAndDelete(id).exec();

        if (!deletedOwner) {
            return res.status(404).json({ message: "Dealership Owner Not Found" });
        }

        res.status(200).json({ message: "Dealership Owner Deleted Successfully" });
    } catch (error) {
        next(error);
    }
};
