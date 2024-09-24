import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Advertisement } from "../models/AdvertisementSubscription.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { Product } from "../models/product.model";
import {DealershipOwner} from "../models/adddealership.model"
import { DealershipApplication } from "../models/applyfordealership.model";
import mongoose from "mongoose";

export const createApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dealershipOwnerId, productId, userId } = req.body;
  
      // Validate dealershipOwnerId
      if (!mongoose.Types.ObjectId.isValid(dealershipOwnerId)) {
        return res.status(400).json({ message: "Invalid DealershipOwner ID" });
      }
      const dealershipOwnerExists = await DealershipOwner.findById(dealershipOwnerId).exec();
      if (!dealershipOwnerExists) {
        return res.status(404).json({ message: "Dealership Owner not found" });
      }
  
      // Validate productId if provided
      if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid Product ID" });
      }
      if (productId) {
        const productExists = await Product.findById(productId).exec();
        if (!productExists) {
          return res.status(404).json({ message: "Product not found" });
        }
      }
  
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }
      const userExists = await User.findById(userId).exec();
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Create and save the application
      const newApplication = new DealershipApplication(req.body);
      const savedApplication = await newApplication.save();
      res.status(201).json({ message: "Application Submitted Successfully", data: savedApplication });
  
    } catch (error) {
      console.error("Error details:", error);
     
      next(error);
    }
  };
  
// Get all applications (optional: filter by dealershipOwnerId or userId)
export const getApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const applications = await DealershipApplication.find(req.query).populate('dealershipOwnerId').exec();
        res.status(200).json({ data: applications });
    } catch (error) {
        next(error);
    }
};

// Get a single application by ID
export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const application = await DealershipApplication.findById(req.params.id).populate('dealershipOwnerId').populate('userId').exec();
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ data: application });
    } catch (error) {
        next(error);
    }
};

// Update an application (e.g., change status)
export const updateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedApplication = await DealershipApplication.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!updatedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ message: "Application Updated Successfully", data: updatedApplication });
    } catch (error) {
        next(error);
    }
};

// Delete an application
export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedApplication = await DealershipApplication.findByIdAndDelete(req.params.id).exec();
        if (!deletedApplication) {
            return res.status(404).json({ message: "Application not found" });
        }
        res.status(200).json({ message: "Application Deleted Successfully" });
    } catch (error) {
        next(error);
    }
};

export const getDealershipApplicationByOwnerId = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { dealershipOwnerId } = req.params;



      
      // Step 2: Log dealershipOwnerId for debugging purposes
      console.log("Querying for dealershipOwnerId:", dealershipOwnerId);

      // Step 3: Query the database to find the application by dealershipOwnerId
      const applications = await DealershipApplication.find({ dealershipOwnerId: new mongoose.Types.ObjectId(dealershipOwnerId) })
          .populate("userId", "name email") // Populate userId with name and email
          .populate("productId", "name") // Populate productId with product name
          .exec();

      // Step 4: Check if no applications are found
      if (!applications || applications.length === 0) {
          return res.status(404).json({ message: "No applications found for the given dealershipOwnerId" });
      }

      // Step 5: Structure the response
      const formattedApplications = applications.map(application => ({
          _id: application._id,
          Organisation_name: application.Organisation_name,
          Type: application.Type,
          Brand: application.Brand,
          productId: application.productId,
          userId: application.userId,
          userName: application.userId?.name || "", // Populated user name
          email: application.email,
          image: application.image,
          countryId: application.countryId,
          stateId: application.stateId,
          cityId: application.cityId,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
      }));

      // Step 6: Send the response
      res.status(200).json({ data: formattedApplications });
  } catch (error) {
      // Step 7: Log any errors for debugging purposes
      console.error("Error in getDealershipApplicationByOwnerId:", error);

      // Step 8: Pass the error to the next middleware (error handler)
      next(error);
  }
};