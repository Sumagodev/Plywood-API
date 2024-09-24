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
exports.getDealershipApplicationByUserId = exports.deleteApplication = exports.updateApplication = exports.getApplicationById = exports.getApplications = exports.createApplication = void 0;
const user_model_1 = require("../models/user.model");
const product_model_1 = require("../models/product.model");
const adddealership_model_1 = require("../models/adddealership.model");
const applyfordealership_model_1 = require("../models/applyfordealership.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dealershipOwnerId, productId, userId } = req.body;
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
            const productExists = yield product_model_1.Product.findById(productId).exec();
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
// export const getDealershipApplicationByOwnerId = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//       const { id } = req.params;
//       // Step 2: Log dealershipOwnerId for debugging purposes
//       console.log("Querying for dealershipOwnerId:", id);
//       // Step 3: Query the database to find the application by dealershipOwnerId
//       const applications = await DealershipApplication.find({ dealershipOwnerId: new mongoose.Types.ObjectId(id) })
//           .populate("userId", "name email") // Populate userId with name and email
//           .populate("productId", "name") // Populate productId with product name
//           .exec();
//       // Step 4: Check if no applications are found
//       if (!applications || applications.length === 0) {
//           return res.status(404).json({ message: "No applications found for the given dealershipOwnerId" });
//       }
//       // Step 5: Structure the response
//       const formattedApplications = applications.map(application => ({
//           _id: application._id,
//           Organisation_name: application.Organisation_name,
//           Type: application.Type,
//           Brand: application.Brand,
//           productId: application.productId?.name || "", // Populated product name
//           userId: application.userId?._id || "", // User ID reference
//           userName: application.userId?.name || "", // Populated user name
//           email: application.userId?.email || "", // Populated email from userId
//           image: application.image,
//           countryId: application.countryId,
//           stateId: application.stateId,
//           cityId: application.cityId,
//           createdAt: application.createdAt,
//           updatedAt: application.updatedAt,
//       }));
//       // Step 6: Send the response
//       res.status(200).json({ data: formattedApplications });
//   } catch (error) {
//       // Step 7: Log any errors for debugging purposes
//       res.status(404).json({ message: "No applications found for the given dealershipOwnerId" });
//       // Step 8: Pass the error to the next middleware (error handler)
//   }
// };
const getDealershipApplicationByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Step 1: Check if userId is a valid ObjectId
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }
        // Step 2: Log the userId to ensure it's received correctly
        console.log("Querying for applications with userId:", userId);
        // Step 3: Query the database to find all DealershipApplications by userId
        const applications = yield applyfordealership_model_1.DealershipApplication.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            .populate("userId", "name email") // Populate userId with name and email
            .populate("stateId", "name") // Populate stateId with state name
            .exec();
        // Step 4: Log the result of the query
        console.log("Applications found:", applications);
        // Step 5: Check if no applications are found
        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: "Dealership Applications Not Found" });
        }
        // Step 6: Format the response to include all application information without cities
        const applicationInfos = applications.map((application) => {
            var _a;
            return ({
                _id: application._id,
                Organisation_name: application.Organisation_name,
                Type: application.Type,
                Product: application.Product,
                Brand: application.Brand,
                productId: application.productId,
                userId: application.userId,
                image: application.image,
                stateId: application.stateId,
                stateName: ((_a = application.stateId) === null || _a === void 0 ? void 0 : _a.name) || "",
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
            });
        });
        // Step 7: Send the response with the array of application data
        res.status(200).json({ data: applicationInfos });
    }
    catch (error) {
        // Step 8: Log any errors for debugging purposes
        console.error("Error in getDealershipApplicationByUserId:", error);
        // Step 9: Pass the error to the next middleware (error handler)
        next(error);
    }
});
exports.getDealershipApplicationByUserId = getDealershipApplicationByUserId;
