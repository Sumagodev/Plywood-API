import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Advertisement } from "../models/AdvertisementSubscription.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { State } from "../models/State.model";
import { Product } from "../models/product.model";
import { DealershipOwner } from "../models/adddealership.model";
import mongoose from "mongoose";
import { Category } from "../models/category.model";

// Create a new dealership owner (linked to an existing user)xxxxx
export const createDealershipOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, image, cityId, productId, Product, stateId, categoryId, Brand, email } = req.body;

        // Check if the user exists
        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Handle image upload if provided
        if (image && typeof image === 'string') {
            req.body.image = await storeFileAndReturnNameBase64(image);
        }

        // Ensure cityId is an array
        if (cityId && !Array.isArray(cityId)) {
            return res.status(400).json({ message: "cityId must be an array" });
        }

        // Create a new dealership owner entry
        const newOwner = new DealershipOwner({
            ...req.body,
            productId: productId || Product, // Use productId if provided, otherwise fall back to Product
        });
        const savedOwner = await newOwner.save();

        res.status(201).json({ message: "Dealership Owner Created Successfully", data: savedOwner });
    } catch (error) {
        next(error);
    }
};


export const getAllDealershipOwners = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Find all dealership owners and populate the userId field
        const owners = await DealershipOwner.find()
            // Populate userId with cityId and stateId
            .exec();

        if (!owners.length) {
            return res.status(200).json({
                message: "No dealership owners found",
                data: [],
                success: true
            });
        }
     
        // Step 5: Check if no owners are found
        if (!owners || owners.length === 0) {
            return res.status(404).json({ message: "Dealership Owners Not Found" });
        }

        const cityIds = owners.flatMap(app => app.cityId); // Flatten cityId arrays
        const stateIds = owners.map(app => app.stateId).filter(Boolean); // Get all stateIds
        const categoryIds = owners.flatMap(app => app.categoryArr).filter(Boolean); // Flatten and get categoryArr

        const cities = await City.find({ _id: { $in: cityIds } }).lean();
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));

        const states = await State.find({ _id: { $in: stateIds } }).lean();
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));

        const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
        const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));

        // Step 5: Structure the response
        const dealershipInfos = owners.map(owner => {
            const populatedCities = owner.cityId.map((cityId: string) => ({
                cityId,
                cityName: cityMap.get(cityId) || "Unknown City"
            }));

            const populatedCategories = owner.categoryArr.map((categoryId: string) => ({
                categoryId,
                categoryName: categoryMap.get(categoryId) || "Unknown Category"
            }));

            return {
                _id: owner._id,
                Organisation_name: owner.Organisation_name,
                Type: owner.Type,
                Product: owner.Product,
                Brand: owner.Brand,
                productId: owner.productId,
                userId: owner.userId,
                
                image: owner.image,
                Email:owner.email,
                stateId: owner.stateId._id,
                stateName: owner.stateId ? stateMap.get(owner.stateId.toString()) || "Unknown State" : "", // Populated state name
                cities: populatedCities,              // Use formatted cities if available
                categories: populatedCategories,      // Use formatted categories
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt,
            };
        });

        // Step 7: Send the response with the array of dealership data
        res.status(200).json({ data: dealershipInfos });
    } catch (err) {
        next(err);
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


export const getDealershipOwnerByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        // Step 1: Check if userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Step 2: Log the userId to ensure it's received correctly
        console.log("Querying for userId:", userId);

        // Step 3: Query the database to find all DealershipOwners by userId
        const owners = await DealershipOwner.find({ userId: new mongoose.Types.ObjectId(userId) })
            .populate("userId", "name email")  // Populate userId with name and email
        // Populate stateId with state name
            .exec();

        // Step 4: Log the result of the query
        console.log("Owners found:", owners);

        // Step 5: Check if no owners are found
        if (!owners || owners.length === 0) {
            return res.status(404).json({ message: "Dealership Owners Not Found" });
        }

        const cityIds = owners.flatMap(app => app.cityId); // Flatten cityId arrays
        const stateIds = owners.map(app => app.stateId).filter(Boolean); // Get all stateIds
        const categoryIds = owners.flatMap(app => app.categoryArr).filter(Boolean); // Flatten and get categoryArr

        const cities = await City.find({ _id: { $in: cityIds } }).lean();
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));

        const states = await State.find({ _id: { $in: stateIds } }).lean();
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));

        const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
        const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));

        // Step 5: Structure the response
        const dealershipInfos = owners.map(owner => {
            const populatedCities = owner.cityId.map((_id: string) => ({
                _id,
                name: cityMap.get(_id) || "Unknown City"
            }));

            const populatedCategories = owner.categoryArr.map((_id: string) => ({
                _id,
                name: categoryMap.get(_id) || "Unknown Category"
            }));

            return {
                _id: owner._id,
                Organisation_name: owner.Organisation_name,
                Type: owner.Type,
                Product: owner.Product,
                Brand: owner.Brand,
                productId: owner.productId,
                userId: owner.userId,
                image: owner.image,
                stateId: owner.stateId,
                stateName: owner.stateId ? stateMap.get(owner.stateId.toString()) || "Unknown State" : "", // Populated state name
                cities: populatedCities,              // Use formatted cities if available
                categories: populatedCategories,      // Use formatted categories
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt,
            };
        });

        // Step 7: Send the response with the array of dealership data
        res.status(200).json({ data: dealershipInfos });

    } catch (error) {
        // Step 8: Log any errors for debugging purposes
        console.error("Error in getDealershipOwnerByUserId:", error);

        // Step 9: Pass the error to the next middleware (error handler)
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
