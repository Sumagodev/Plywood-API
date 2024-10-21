import express from "express";
import {
    createBannerImage,
    getAllBannerImages,
    getBannerImageById,
    updateBannerImage,
    deleteBannerImage,getBannerImagesByUserId,getAllBannerImagesverifeidonly
} from "../controllers/BannerImage.controller";

const router = express.Router();

// Routes for banner images
router.post("/postbanner", createBannerImage);              // Create a banner image
router.get("/getbanner", getAllBannerImages);       
router.get("/getbannerforhomepage", getAllBannerImagesverifeidonly);            // Get all banner images
router.get("/getBannerImagesByUserId/:userId", getBannerImagesByUserId);          // Get a banner image by ID
router.put("/updatebanner/:id", updateBannerImage);   
router.get("/getBannerImageById/:id", getBannerImageById);           // Update a banner image by ID
        // Update a banner image by ID
router.delete("/deletebanner/:id", deleteBannerImage);        // Delete a banner image by ID

export default router;
