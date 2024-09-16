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
exports.getAllStateDetails = exports.deleteStateDetail = exports.updateStateDetail = exports.getStateDetail = exports.addStateDetail = void 0;
const fileSystem_1 = require("../helpers/fileSystem");
const State_model_1 = require("../models/State.model");
const StateDetail_model_1 = require("../models/StateDetail.model");
const addStateDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log the incoming request body
        console.log(req.body);
        // Check if the stateId exists
        const stateObj = yield State_model_1.State.findById(req.body.stateId);
        if (!stateObj) {
            throw new Error("State not found");
        }
        // Check if an entry with the same stateId already exists
        const existingStateDetail = yield StateDetail_model_1.StateDetail.findOne({
            stateId: req.body.stateId,
        }).exec();
        if (existingStateDetail) {
            throw new Error("State Detail for this stateId already exists");
        }
        // Process image if provided
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        // Create a new StateDetail object
        const newStateDetail = new StateDetail_model_1.StateDetail(Object.assign(Object.assign({}, req.body), { stateId: stateObj._id }));
        // Save the new StateDetail entry
        const savedStateDetail = yield newStateDetail.save();
        if (!savedStateDetail) {
            throw new Error("Unable to create StateDetail");
        }
        // Respond with success message
        res.status(200).json({ message: "StateDetail Successfully Created", success: true, data: savedStateDetail });
    }
    catch (err) {
        // Handle errors
        next(err);
    }
});
exports.addStateDetail = addStateDetail;
const getStateDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find the StateDetail by its ID and populate the state name
        const stateDetail = yield StateDetail_model_1.StateDetail.findById(id)
            .populate({
            path: 'stateId',
            select: 'name',
            model: State_model_1.State, // Specify the model you are populating from
        });
        if (!stateDetail) {
            throw new Error("StateDetail not found");
        }
        // Respond with the state detail including the state name
        res.status(200).json({ success: true, data: stateDetail });
    }
    catch (err) {
        next(err);
    }
});
exports.getStateDetail = getStateDetail;
const updateStateDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find the existing StateDetail
        const stateDetail = yield StateDetail_model_1.StateDetail.findById(id);
        if (!stateDetail) {
            throw new Error("StateDetail not found");
        }
        // Process the image if provided
        if (req.body.image) {
            req.body.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.image);
        }
        // Update the StateDetail fields
        const updatedStateDetail = yield StateDetail_model_1.StateDetail.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedStateDetail) {
            throw new Error("Unable to update StateDetail");
        }
        // Respond with the updated state detail
        res.status(200).json({ success: true, message: "StateDetail Successfully Updated", data: updatedStateDetail });
    }
    catch (err) {
        next(err);
    }
});
exports.updateStateDetail = updateStateDetail;
const deleteStateDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find and delete the StateDetail
        const deletedStateDetail = yield StateDetail_model_1.StateDetail.findByIdAndDelete(id);
        if (!deletedStateDetail) {
            throw new Error("StateDetail not found");
        }
        // Respond with a success message
        res.status(200).json({ success: true, message: "StateDetail Successfully Deleted" });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteStateDetail = deleteStateDetail;
const getAllStateDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find all StateDetails and populate the associated State details
        const stateDetails = yield StateDetail_model_1.StateDetail.find({})
            .populate({
            path: 'stateId',
            model: State_model_1.State, // Specify the model to populate from
        });
        if (!stateDetails.length) {
            throw new Error("No StateDetails found");
        }
        // Respond with all state details, including the populated state information
        res.status(200).json({ success: "True............................", dataffdfffd: stateDetails });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllStateDetails = getAllStateDetails;
