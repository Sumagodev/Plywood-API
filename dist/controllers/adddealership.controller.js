"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllDealershipOwners = exports.deleteDealershipOwner = exports.updateDealershipOwner = exports.getDealershipOwnerByUserId = exports.getDealershipOwnerById = exports.getAllDealershipOwners = exports.createDealershipOwner = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const user_model_1 = require("../models/user.model");
const City_model_1 = require("../models/City.model");
const State_model_1 = require("../models/State.model");
const adddealership_model_1 = require("../models/adddealership.model");
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = require("../models/category.model");
// Create a new dealership owner (linked to an existing user)xxxxx
const createDealershipOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, image, cityId, productId, Product, stateId, categoryId, Brand, email } = req.body;
        // Check if the user exists
        const user = yield user_model_1.User.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Handle image upload if provided
        if (image && typeof image === 'string') {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(image);
        }
        // Ensure cityId is an array
        if (cityId && !Array.isArray(cityId)) {
            return res.status(400).json({ message: "cityId must be an array" });
        }
        // Create a new dealership owner entry
        const newOwner = new adddealership_model_1.DealershipOwner(Object.assign(Object.assign({}, req.body), { productId: productId || Product }));
        const savedOwner = yield newOwner.save();
        res.status(201).json({ message: "Dealership Owner Created Successfully", data: savedOwner });
    }
    catch (error) {
        next(error);
    }
});
exports.createDealershipOwner = createDealershipOwner;
// Assuming mongoose is already imported
const getAllDealershipOwners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all dealership owners
        const owners = yield adddealership_model_1.DealershipOwner.find().exec();
        if (!owners.length) {
            return res.status(200).json({
                message: "No dealership owners found",
                data: [],
                success: true
            });
        }
        // Extract city, state, and category IDs and convert them to ObjectId
        const cityIds = owners.flatMap(owner => owner.cityId).map(id => new mongoose_1.default.Types.ObjectId(id)); // Add 'new'
        const stateIds = owners.map(owner => owner.stateId).filter(Boolean).map(id => new mongoose_1.default.Types.ObjectId(id)); // Add 'new'
        const categoryIds = owners.flatMap(owner => owner.categoryArr).filter(Boolean).map(id => new mongoose_1.default.Types.ObjectId(id)); // Add 'new'
        // Fetch related data
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean();
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        const states = yield State_model_1.State.find({ _id: { $in: stateIds } }).lean();
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));
        const categories = yield category_model_1.Category.find({ _id: { $in: categoryIds } }).lean();
        const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));
        // Map over the owners to build the response
        const dealershipInfos = owners.map(owner => {
            const populatedCities = owner.cityId.map((_id) => ({
                _id,
                name: cityMap.get(_id) || "Unknown City"
            }));
            const populatedCategories = owner.categoryArr.map((_id) => ({
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
                Email: owner.email,
                stateId: owner.stateId,
                stateName: stateMap.get(owner.stateId.toString()) || "Unknown State",
                cities: populatedCities,
                categories: populatedCategories,
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt,
            };
        });
        // Send the response
        res.status(200).json({ data: dealershipInfos });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllDealershipOwners = getAllDealershipOwners;
// Get a single dealership owner by ID
const getDealershipOwnerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const owner = yield adddealership_model_1.DealershipOwner.findById(id).populate("userId").exec();
        if (!owner) {
            return res.status(404).json({ message: "Dealership Owner Not Found" });
        }
        res.status(200).json({ data: owner });
    }
    catch (error) {
        next(error);
    }
});
exports.getDealershipOwnerById = getDealershipOwnerById;
const getDealershipOwnerByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Step 1: Check if userId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }
        // Step 2: Log the userId to ensure it's received correctly
        console.log("Querying for userId:", userId);
        // Step 3: Query the database to find all DealershipOwners by userId
        const owners = yield adddealership_model_1.DealershipOwner.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            .populate("userId", "name email") // Populate userId with name and email
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
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean();
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        const states = yield State_model_1.State.find({ _id: { $in: stateIds } }).lean();
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));
        const categories = yield category_model_1.Category.find({ _id: { $in: categoryIds } }).lean();
        const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));
        // Step 5: Structure the response
        const dealershipInfos = owners.map(owner => {
            const populatedCities = owner.cityId.map((_id) => ({
                _id,
                name: cityMap.get(_id) || "Unknown City"
            }));
            const populatedCategories = owner.categoryArr.map((_id) => ({
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
                stateName: owner.stateId ? stateMap.get(owner.stateId.toString()) || "Unknown State" : "",
                cities: populatedCities,
                categories: populatedCategories,
                createdAt: owner.createdAt,
                updatedAt: owner.updatedAt,
            };
        });
        // Step 7: Send the response with the array of dealership data
        res.status(200).json({ data: dealershipInfos });
    }
    catch (error) {
        // Step 8: Log any errors for debugging purposes
        console.error("Error in getDealershipOwnerByUserId:", error);
        // Step 9: Pass the error to the next middleware (error handler)
        next(error);
    }
});
exports.getDealershipOwnerByUserId = getDealershipOwnerByUserId;
// Update a dealership owner by ID
const updateDealershipOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const owner = yield adddealership_model_1.DealershipOwner.findById(id).exec();
        if (!owner) {
            return res.status(404).json({ message: "Dealership Owner Not Found" });
        }
        const updatedOwner = yield adddealership_model_1.DealershipOwner.findByIdAndUpdate(id, req.body, { new: true }).exec();
        res.status(200).json({ message: "Dealership Owner Updated Successfully", data: updatedOwner });
    }
    catch (error) {
        next(error);
    }
});
exports.updateDealershipOwner = updateDealershipOwner;
// Delete a dealership owner by ID
const deleteDealershipOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedOwner = yield adddealership_model_1.DealershipOwner.findByIdAndDelete(id).exec();
        if (!deletedOwner) {
            return res.status(404).json({ message: "Dealership Owner Not Found" });
        }
        res.status(200).json({ message: "Dealership Owner Deleted Successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteDealershipOwner = deleteDealershipOwner;
const deleteAllDealershipOwners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use deleteMany to remove all documents in the DealershipOwner collection
        const result = yield adddealership_model_1.DealershipOwner.deleteMany({});
        return res.status(200).json({
            success: true,
            message: "All dealership owner records have been deleted.",
            deletedCount: result.deletedCount, // Number of documents deleted
        });
    }
    catch (error) {
        console.error("Error deleting dealership owner records:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting dealership owner records.",
        });
    }
});
exports.deleteAllDealershipOwners = deleteAllDealershipOwners;
