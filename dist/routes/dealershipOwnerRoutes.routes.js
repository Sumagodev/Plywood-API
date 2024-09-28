"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adddealership_controller_1 = require("../controllers/adddealership.controller"); // Import your controller functions
const router = (0, express_1.Router)();
// Route to create a new dealership owner
router.post("/addDealershipOpportunity", adddealership_controller_1.createDealershipOwner);
// Route to get all dealership owners
router.get("/getDelearshipOpportunities", adddealership_controller_1.getAllDealershipOwners);
// Route to get a single dealership owner by ID
router.get("/getDelearshipOpportunities/:id", adddealership_controller_1.getDealershipOwnerById);
// Route to update a dealership owner by ID
router.put("/dealership-owners/:id", adddealership_controller_1.updateDealershipOwner);
// Route to delete a dealership owner by ID
router.delete("/dealership-owners/:id", adddealership_controller_1.deleteDealershipOwner);
//
router.get("/deleteAllDealershipOwners", adddealership_controller_1.deleteAllDealershipOwners);
exports.default = router;
