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
// Create a new dealership owner (linked to an existing user)
export const createDealershipOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, image, cityId, productId, Product, stateId ,categoryId} = req.body;

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

        // Extract city and state IDs from the owners
        const cityIds = Array.from(new Set(owners.flatMap(owner => owner.cityId)));
        const stateIds = Array.from(new Set(owners.flatMap(owner => owner.stateId)));

        // Fetch cities and states based on extracted IDs
        const [cities, states] = await Promise.all([
            City.find({ _id: { $in: cityIds } }).lean().exec(),
            State.find({ _id: { $in: stateIds } }).lean().exec()
        ]);

        // Create mappings for cities and states
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));

        // Format the output to include city names and state names
        const ownersWithCityState = owners.map(owner => {
            // Map over the cityIds array to get city names
            const cities = owner.cityId.map((cityId: string) => ({
                cityId,
                cityName: cityMap.get(cityId) || 'Unknown City'
            }));

            // Get the state name
            const stateName = stateMap.get(owner.stateId) || 'Unknown State';

            return {
                ...owner.toObject(), // Convert Mongoose document to plain JavaScript object
                stateName,
                cities // Include cities array
            };
        });

        res.status(200).json({
            message: "Get Dealership Owners",
            data: ownersWithCityState,
            success: true
        });
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
        const owners = await DealershipOwner.find({ userId: new mongoose.Types.ObjectId(userId) })  // Use find to get all records
            .populate("userId", "name email") // Populate userId with name and email
            .populate("stateId", "name") // Populate stateId with state name
            .populate({
                path: "cityId", // Assuming cityId references the City model
                select: "name",
            })
            .exec();

        // Step 4: Log the result of the query
        console.log("Owners found:", owners);

        // Step 5: Check if no owners are found
        if (!owners || owners.length === 0) {
            return res.status(404).json({ message: "Dealership Owners Not Found" });
        }

        // Step 6: Format the response to include all dealership information
        const dealershipInfos = owners.map((owner) => {
            const formattedCities = owner.cityId.map((city: any) => ({
                cityId: city._id,
                cityName: city.name,
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
                stateName: owner.stateId?.name || "", // Use populated state name
                cities: formattedCities, // Use formatted cities if available
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
