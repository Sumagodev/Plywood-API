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
exports.getApplicationByUserId = exports.getDealershipApplicationByUserId = exports.deleteApplication = exports.updateApplication = exports.getApplicationById = exports.getApplications = exports.createApplication = void 0;
const user_model_1 = require("../models/user.model");
const City_model_1 = require("../models/City.model");
const State_model_1 = require("../models/State.model");
const adddealership_model_1 = require("../models/adddealership.model");
const applyfordealership_model_1 = require("../models/applyfordealership.model");
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = require("../models/category.model");
const createApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dealershipOwnerId, userId, image, cityId, productId, Product, stateId, categoryId, Brand, email } = req.body;
        // Validate dealershipOwnerId
        if (!mongoose_1.default.Types.ObjectId.isValid(dealershipOwnerId)) {
            return res.status(400).json({ message: "Invalid DealershipOwner ID" });
        }
        const dealershipOwnerExists = yield adddealership_model_1.DealershipOwner.findById(dealershipOwnerId).exec();
        if (!dealershipOwnerExists) {
            return res.status(404).json({ message: "Dealership Owner not found" });
        }
        // Validate productId if provided
        if (productId && !mongoose_1.default.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }
        if (productId) {
            const productExists = yield Product.findById(productId).exec();
            if (!productExists) {
                return res.status(404).json({ message: "Product not found" });
            }
        }
        // Validate userId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const userExists = yield user_model_1.User.findById(userId).exec();
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }
        // Create and save the application
        const newApplication = new applyfordealership_model_1.DealershipApplication(req.body);
        const savedApplication = yield newApplication.save();
        res.status(201).json({ message: "Application Submitted Successfully", data: savedApplication });
    }
    catch (error) {
        console.error("Error details:", error);
        next(error);
    }
});
exports.createApplication = createApplication;
// Get all applications (optional: filter by dealershipOwnerId or userId)
const getApplications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield applyfordealership_model_1.DealershipApplication.find(req.query).populate('dealershipOwnerId').exec();
        res.status(200).json({ data: applications });
    }
    catch (error) {
        next(error);
    }
});
exports.getApplications = getApplications;
// Get a single application by ID
const getApplicationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const application = yield applyfordealership_model_1.DealershipApplication.findById(req.params.id).populate('dealershipOwnerId').populate('userId').exec();
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ data: application });
    }
    catch (error) {
        next(error);
    }
});
exports.getApplicationById = getApplicationById;
// Update an application (e.g., change status)
const updateApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedApplication = yield applyfordealership_model_1.DealershipApplication.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ message: "Application Updated Successfully", data: updatedApplication });
    }
    catch (error) {
        next(error);
    }
});
exports.updateApplication = updateApplication;
// Delete an application
const deleteApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedApplication = yield applyfordealership_model_1.DealershipApplication.findByIdAndDelete(req.params.id).exec();
        if (!deletedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ message: "Application Deleted Successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteApplication = deleteApplication;
// export const getDealershipApplicationByUserId = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId } = req.params;
//     // Step 1: Fetch all ownerIds associated with the given userId
//     const owners = await DealershipOwner.find({ userId: new mongoose.Types.ObjectId(userId) });
//     // Check if no owners are found
//     if (!owners || owners.length === 0) {
//       return res.status(404).json({ message: "No owners found for the given userId" });
//     }
//     // Extract the ownerIds
//     const ownerIds = owners.map(owner => owner._id);
//     const productIds = owners.map((product) => product.Product);
//     // Step 2: Query the dealership applications using the ownerIds
//     const applications = await DealershipApplication.find({ dealershipOwnerId: { $in: ownerIds } })
//       .populate("userId", "name email") // Populate userId with name and email
//       .populate("productId", "name") // Populate productId with product name
//       .exec();
//     // Step 3: Check if no applications are found
//     if (!applications || applications.length === 0) {
//       return res.status(404).json({ message: "No applications found for the given userId" });
//     }
//     // Step 4: Structure the response
//     const formattedApplications = applications.map(application => ({
//       _id: application._id,
//       Organisation_name: application.Organisation_name,
//       Type: application.Type,
//       Brand: application.Brand,
//       productId: application.productId?.name || "", // Populated product name
//       userId: application.userId?._id || "", // User ID reference
//       userName: application.userId?.name || "", // Populated user name
//       email: application.userId?.email || "", // Populated email from userId
//       image: application.image,
//       countryId: application.countryId,
//       stateId: application.stateId,
//       cityId: application.cityId,
//       createdAt: application.createdAt,
//       updatedAt: application.updatedAt,
//     }));
//     // Step 5: Send the response
//     res.status(200).json({ data: applications });
//   } catch (error) {
//     // Log any errors for debugging purposes
//     console.error("Error in getDealershipApplicationByUserId:", error);
//     next(error); // Pass the error to the next middleware
//   }
// };
// export const getDealershipApplicationByUserId = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId } = req.params;
//     // Step 1: Fetch all ownerIds associated with the given userId
//     const owners = await DealershipOwner.find({ userId: new mongoose.Types.ObjectId(userId) });
//     // Check if no owners are found
//     if (!owners || owners.length === 0) {
//       return res.status(404).json({ message: "No owners found for the given userId" });
//     }
//     // Extract the ownerIds
//     const ownerIds = owners.map(owner => owner._id);
//     // Step 2: Query the dealership applications using the ownerIds
//     const applications = await DealershipApplication.find({ dealershipOwnerId: { $in: ownerIds } })
//       .populate("userId", "name email") // Populate userId with name and email
//       .populate("productId", "name") // Populate productId with product name
//       .lean(); // Return plain JavaScript objects for easier manipulation
//     // Step 3: Check if no applications are found
//     if (!applications || applications.length === 0) {
//       return res.status(404).json({ message: "No applications found for the given userId" });
//     }
//     // Step 4: Fetch city names, state names, and product names
//     const cityIds = applications.flatMap(app => app.cityId); // Flatten cityId arrays
//     const stateIds = applications.map(app => app.stateId).filter(Boolean); // Get all stateIds
//     const productIds = applications.map(app => app.productId).filter(Boolean).map(product => product._id); // Get productIds
//     const cities = await City.find({ _id: { $in: cityIds } }).lean();
//     const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
//     const products = await Product.find({ _id: { $in: productIds } }).lean(); // Fetch products
//     const productMap = new Map(products.map(product => [product._id.toString(), product.name])); // Create a map for product names
//     const states = await State.find({ _id: { $in: stateIds } }).lean();
//     const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));
//     // Step 5: Structure the response
//     const formattedApplications = applications.map(application => {
//       const populatedCities = application.cityId.map((cityId: string) => ({
//         cityId,
//         cityName: cityMap.get(cityId) || "Unknown City"
//       }));
//       return {
//         _id: application._id,
//         Organisation_name: application.Organisation_name,
//         Type: application.Type,
//         Brand: application.Brand,
//         productName: application.dealershipOwnerId.Product || "", // Populated product name
//         userId: application.userId?._id || "", // User ID reference
//         userName: application.userId?.name || "", // Populated user name
//         email: application.userId?.email || "", // Populated email from userId
//         image: application.image,
//         countryId: application.countryId,
//         stateId: application.stateId,
//         stateName: application.stateId ? stateMap.get(application.stateId.toString()) || "Unknown State" : "", // Populated state name
//         cities: populatedCities, // Array of cities with cityId and cityName
//         createdAt: application.createdAt,
//         updatedAt: application.updatedAt,
//       };
//     });
//     // Step 6: Send the response
//     res.status(200).json({ data: formattedApplications });
//   } catch (error) {
//     // Log any errors for debugging purposes
//     console.error("Error in getDealershipApplicationByUserId:", error);
//     next(error); // Pass the error to the next middleware
//   }
// };
const getDealershipApplicationByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Step 1: Fetch all ownerIds associated with the given userId
        const owners = yield adddealership_model_1.DealershipOwner.find({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        // Check if no owners are found
        if (!owners || owners.length === 0) {
            return res.status(404).json({ message: "No owners found for the given userId" });
        }
        // Extract the ownerIds
        const ownerIds = owners.map(owner => owner._id);
        // Step 2: Query the dealership applications using the ownerIds
        const applications = yield applyfordealership_model_1.DealershipApplication.find({ dealershipOwnerId: { $in: ownerIds } })
            .populate("userId", "name email") // Populate userId with name and email
            .populate("productId", "name") // Populate productId with product name
            .lean(); // Return plain JavaScript objects for easier manipulation
        // Step 3: Check if no applications are found
        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: "No applications found for the given userId" });
        }
        // Step 4: Fetch city names, state names, and category names
        const cityIds = applications.flatMap(app => app.cityId); // Flatten cityId arrays
        const stateIds = applications.map(app => app.stateId).filter(Boolean); // Get all stateIds
        const categoryIds = applications.flatMap(app => app.categoryArr).filter(Boolean); // Flatten and get categoryArr
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean();
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        const states = yield State_model_1.State.find({ _id: { $in: stateIds } }).lean();
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));
        const categories = yield category_model_1.Category.find({ _id: { $in: categoryIds } }).lean();
        const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));
        // Step 5: Structure the response
        const formattedApplications = applications.map(application => {
            var _a, _b, _c, _d;
            const populatedCities = application.cityId.map((cityId) => ({
                cityId,
                cityName: cityMap.get(cityId) || "Unknown City"
            }));
            const populatedCategories = application.categoryArr.map((categoryId) => ({
                categoryId,
                categoryName: categoryMap.get(categoryId) || "Unknown Category"
            }));
            return {
                _id: application._id,
                Organisation_name: application.Organisation_name,
                Type: application.Type,
                Brand: application.Brand,
                productName: ((_a = application.productId) === null || _a === void 0 ? void 0 : _a.name) || "",
                userId: ((_b = application.userId) === null || _b === void 0 ? void 0 : _b._id) || "",
                userName: ((_c = application.userId) === null || _c === void 0 ? void 0 : _c.name) || "",
                email: ((_d = application.userId) === null || _d === void 0 ? void 0 : _d.email) || "",
                image: application.image,
                countryId: application.countryId,
                stateId: application.stateId._id,
                stateName: application.stateId ? stateMap.get(application.stateId.toString()) || "Unknown State" : "",
                cities: populatedCities,
                categories: populatedCategories,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
            };
        });
        // Step 6: Send the response
        res.status(200).json({ data: formattedApplications });
    }
    catch (error) {
        // Log any errors for debugging purposes
        console.error("Error in getDealershipApplicationByUserId:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getDealershipApplicationByUserId = getDealershipApplicationByUserId;
const getApplicationByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applications = yield applyfordealership_model_1.DealershipApplication.find({ userId: req.params.userId })
            .populate('dealershipOwnerId')
            .exec();
        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: "No applications found for this user" });
        }
        const cityIds = applications.flatMap(app => app.cityId); // Flatten cityId arrays
        const stateIds = applications.map(app => app.stateId).filter(Boolean); // Get all stateIds
        const categoryIds = applications.flatMap(app => app.categoryArr).filter(Boolean); // Flatten and get categoryArr
        const cities = yield City_model_1.City.find({ _id: { $in: cityIds } }).lean();
        const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));
        const states = yield State_model_1.State.find({ _id: { $in: stateIds } }).lean();
        const stateMap = new Map(states.map(state => [state._id.toString(), state.name]));
        const categories = yield category_model_1.Category.find({ _id: { $in: categoryIds } }).lean();
        const categoryMap = new Map(categories.map(category => [category._id.toString(), category.name]));
        // Step 5: Structure the response
        const dealershipInfos = applications.map(owner => {
            const populatedCities = owner.cityId.map((cityId) => ({
                cityId,
                cityName: cityMap.get(cityId) || "Unknown City"
            }));
            const populatedCategories = owner.categoryArr.map((_id) => ({
                _id,
                Name: categoryMap.get(_id) || "Unknown Category"
            }));
            return {
                _id: owner._id,
                Organisation_name: owner.Organisation_name,
                Type: owner.Type,
                Product: owner.Product,
                Email: owner.email,
                Brand: owner.Brand,
                productId: owner.productId,
                userId: owner.userId,
                image: owner.image,
                stateId: owner.stateId._id,
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
        next(error);
    }
});
exports.getApplicationByUserId = getApplicationByUserId;
