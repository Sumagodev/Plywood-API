import { Router } from "express";
import {
    createDealershipOwner,
    getAllDealershipOwners,
    getDealershipOwnerById,
    updateDealershipOwner,
    deleteDealershipOwner
} from "../controllers/adddealership.controller"; // Import your controller functions

const router = Router();

// Route to create a new dealership owner
router.post("/dealership-owners", createDealershipOwner);

// Route to get all dealership owners
router.get("/dealership-owners", getAllDealershipOwners);

// Route to get a single dealership owner by ID
router.get("/dealership-owners/:id", getDealershipOwnerById);

// Route to update a dealership owner by ID
router.put("/dealership-owners/:id", updateDealershipOwner);

// Route to delete a dealership owner by ID
router.delete("/dealership-owners/:id", deleteDealershipOwner);

export default router;
