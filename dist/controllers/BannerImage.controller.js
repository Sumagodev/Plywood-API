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
exports.deleteBannerImage = exports.updateBannerImage = exports.getBannerImagesByUserId = exports.getBannerImageById = exports.getAllBannerImages = exports.createBannerImage = void 0;
const dateUtils_1 = require("../helpers/dateUtils");
const fileSystem_1 = require("../helpers/fileSystem");
const BannerImages_model_1 = require("../models/BannerImages.model");
const user_model_1 = require("../models/user.model");
const createBannerImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, productId, userId, image, startDate, endDate, url } = req.body;
        // Check for existing banner image for the same product and user (except for Adminbanner)
        if (type !== "Adminbanner") {
            const BannerImageCheck = yield BannerImages_model_1.BannerImage.findOne({
                productId: productId, userId: userId
            }).exec();
            if (BannerImageCheck)
                throw new Error("Entry already exists, cannot create new BannerImage. Please change product or dates to create one.");
        }
        // Validate the banner type
        if (!type || (type !== "profilebanner" && type !== "productbanner" && type !== "Adminbanner")) {
            return res.status(400).json({ message: "Invalid banner type provided.", success: false });
        }
        // Adminbanner doesn't need productId or userId checks
        let userObj;
        if (type !== "Adminbanner") {
            // Check if the user exists
            userObj = yield user_model_1.User.findById(userId).exec();
            if (!userObj) {
                throw new Error("User not found!");
            }
            // Calculate date difference (if applicable to banner)
            let dateDiff = 0;
            if (startDate && endDate) {
                dateDiff = (0, dateUtils_1.dateDifference)(startDate, endDate);
            }
            // Check if the user has enough sale days to create this banner
            if (userObj.numberOfBannerImages - dateDiff <= 0) {
                throw new Error("You do not have enough banner sale days left in your account. Please reduce the duration of the banner or purchase a top-up.");
            }
            // Update user's saleDays and numberOfSales (if applicable)
            yield user_model_1.User.findByIdAndUpdate(userObj._id, { $inc: { bannerimagesDays: -1, numberOfBannerImages: -dateDiff } }).exec();
        }
        // Handle base64 image upload if the image is base64 encoded
        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(image); // Save the image and return the file name
        }
        // Create the new banner record
        const newBanner = new BannerImages_model_1.BannerImage({
            image: storedImage,
            type: type,
            userId: userId || null,
            productId: productId || null,
            startDate: startDate || null,
            endDate: endDate || null,
            url: type === "Adminbanner" ? url : null // Only include url if Adminbanner
        });
        yield newBanner.save();
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
        const bannerImages = yield BannerImages_model_1.BannerImage.find().populate({
            path: 'productId',
            select: 'slug', // Only return the `slug` field from the Product model
        }).populate({
            path: 'userId',
            select: 'username email', // Select fields from User (modify as per your schema)
        });
        ;
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
const getBannerImagesByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bannerImages = yield BannerImages_model_1.BannerImage.find({ userId: req.params.userId })
            .populate({
            path: 'productId',
            select: 'slug', // Only return the `slug` field from the Product model
        });
        // Check if any banners were found
        if (!bannerImages.length) {
            return res.status(404).json({ message: "No banner images found for the given user.", success: false });
        }
        res.status(200).json({ success: true, bannerImages });
    }
    catch (err) {
        next(err);
    }
});
exports.getBannerImagesByUserId = getBannerImagesByUserId;
// Update a banner image by ID
const updateBannerImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { type, productId, userId, image, isVerified } = req.body;
        let storedImage = image;
        if (image && image.includes("base64")) {
            storedImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(image);
        }
        const updatedBannerImage = yield BannerImages_model_1.BannerImage.findByIdAndUpdate(id, {
            image: storedImage,
            type: type,
            userId: userId,
            productId: productId,
            isVerified: isVerified, // Updating isVerified field
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
