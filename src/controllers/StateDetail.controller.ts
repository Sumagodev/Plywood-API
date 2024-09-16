import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { State } from "../models/State.model";
import { string_to_slug } from "../helpers/stringify";
import { Country } from "../models/country.model";
import { StateDetail } from "../models/StateDetail.model";
export const addStateDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log the incoming request body
    console.log(req.body);

    // Check if the stateId exists
    const stateObj = await State.findById(req.body.stateId)
    if (!stateObj) {
      throw new Error("State not found");
    }

    // Check if an entry with the same stateId already exists
    const existingStateDetail = await StateDetail.findOne({
      stateId: req.body.stateId,
    }).exec();
    if (existingStateDetail) {
      throw new Error("State Detail for this stateId already exists");
    }

    // Process image if provided
    if (req.body.image) {
      req.body.image = await storeFileAndReturnNameBase64(req.body.image);
    }

    // Create a new StateDetail object
    const newStateDetail = new StateDetail({
      ...req.body,
      stateId: stateObj._id, // Ensure stateId is set correctly
    });

    // Save the new StateDetail entry
    const savedStateDetail = await newStateDetail.save();
    if (!savedStateDetail) {
      throw new Error("Unable to create StateDetail");
    }

    // Respond with success message
    res.status(200).json({ message: "StateDetail Successfully Created", success: true, data: savedStateDetail });
  } catch (err) {
    // Handle errors
    next(err);
  }
};
export const getStateDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Find the StateDetail by its ID and populate the state name
    const stateDetail = await StateDetail.findById(id)
      .populate({
        path: 'stateId',  // The field you are referencing in the StateDetail model
        select: 'name',   // Specify the field(s) to return from the State model
        model: State,     // Specify the model you are populating from
      });

    if (!stateDetail) {
      throw new Error("StateDetail not found");
    }

    // Respond with the state detail including the state name
    res.status(200).json({ success: true, data: stateDetail });
  } catch (err) {
    next(err);
  }
};
export const updateStateDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Find the existing StateDetail
    const stateDetail = await StateDetail.findById(id);
    if (!stateDetail) {
      throw new Error("StateDetail not found");
    }

    // Process the image if provided
    if (req.body.image) {
      req.body.image = await storeFileAndReturnNameBase64(req.body.image);
    }

    // Update the StateDetail fields
    const updatedStateDetail = await StateDetail.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedStateDetail) {
      throw new Error("Unable to update StateDetail");
    }

    // Respond with the updated state detail
    res.status(200).json({ success: true, message: "StateDetail Successfully Updated", data: updatedStateDetail });
  } catch (err) {
    next(err);
  }
};
export const deleteStateDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Find and delete the StateDetail
    const deletedStateDetail = await StateDetail.findByIdAndDelete(id);
    if (!deletedStateDetail) {
      throw new Error("StateDetail not found");
    }

    // Respond with a success message
    res.status(200).json({ success: true, message: "StateDetail Successfully Deleted" });
  } catch (err) {
    next(err);
  }
};
export const getAllStateDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Find all StateDetails and populate the associated State details
    const stateDetails = await StateDetail.find({})
      .populate({
        path: 'stateId', // The field in StateDetail referencing the State
        model: State,    // Specify the model to populate from
      });

    if (!stateDetails.length) {
      throw new Error("No StateDetails found");
    }

    // Respond with all state details, including the populated state information
    res.status(200).json({ success: true, data: stateDetails });
  } catch (err) {
    next(err);
  }
};