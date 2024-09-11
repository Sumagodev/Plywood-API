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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDealershipOwner = exports.updateDealershipOwner = exports.getDealershipOwnerById = exports.getAllDealershipOwners = exports.createDealershipOwner = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const user_model_1 = require("../models/user.model");
const adddealership_model_1 = require("../models/adddealership.model");
// Create a new dealership owner (linked to an existing user)
const createDealershipOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, image, cityId, productId, Product, stateId } = req.body;
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
// Get all dealership owners
const getAllDealershipOwners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owners = yield adddealership_model_1.DealershipOwner.find().populate("userId").exec();
        res.status(200).json({ data: owners });
    }
    catch (error) {
        next(error);
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
