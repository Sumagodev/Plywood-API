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
exports.deleteBannerImage = exports.updateBannerImage = exports.getBannerImageById = exports.getAllBannerImages = exports.createBannerImage = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const BannerImages_model_1 = require("../models/BannerImages.model");
const createBannerImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, productId, userId, image } = req.body;
        // Check if the type is valid (either "profilebanner" or "productbanner")
        if (!type || (type !== "profilebanner" && type !== "productbanner")) {
            return res.status(400).json({ message: "Invalid banner type provided.", success: false });
        }
        // Handle base64 image upload if the image contains base64 data
        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(image); // Save the image and return the file name
        }
        // Create the new banner record directly without productSlug
        yield new BannerImages_model_1.BannerImage({
            image: storedImage,
            userId: type === "profilebanner" ? userId : undefined,
            productId: type === "productbanner" ? productId : undefined,
        }).save();
        res.status(200).json({ message: "Banner image added successfully.", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.createBannerImage = createBannerImage;
// Get all banner images
const getAllBannerImages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bannerImages = yield BannerImages_model_1.BannerImage.find();
        res.status(200).json({ success: true, bannerImages });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllBannerImages = getAllBannerImages;
// Get a single banner image by ID
const getBannerImageById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const bannerImage = yield BannerImages_model_1.BannerImage.findById(id).populate({
            path: 'productId',
            select: 'slug', // Only return the `slug` field from the Product model
        });
        ;
        if (!bannerImage) {
            return res.status(404).json({ message: "Banner image not found.", success: false });
        }
        res.status(200).json({ success: true, bannerImage });
    }
    catch (err) {
        next(err);
    }
});
exports.getBannerImageById = getBannerImageById;
// Update a banner image by ID
const updateBannerImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { type, productId, userId, image } = req.body;
        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(image);
        }
        const updatedBannerImage = yield BannerImages_model_1.BannerImage.findByIdAndUpdate(id, {
            image: storedImage,
            userId: type === "profilebanner" ? userId : undefined,
            productId: type === "productbanner" ? productId : undefined,
        }, { new: true } // Return the updated document
        );
        if (!updatedBannerImage) {
            return res.status(404).json({ message: "Banner image not found.", success: false });
        }
        res.status(200).json({ message: "Banner image updated successfully.", success: true, updatedBannerImage });
    }
    catch (err) {
        next(err);
    }
});
exports.updateBannerImage = updateBannerImage;
// Delete a banner image by ID
const deleteBannerImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const bannerImage = yield BannerImages_model_1.BannerImage.findByIdAndDelete(id);
        if (!bannerImage) {
            return res.status(404).json({ message: "Banner image not found.", success: false });
        }
        res.status(200).json({ message: "Banner image deleted successfully.", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteBannerImage = deleteBannerImage;
