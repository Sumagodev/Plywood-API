import express from "express";
import { addLead, getLead, deleteById, getById, updateById, getLeadsBycreatedById, getLeadsForAdmin } from "../controllers/lead.controller";
// import {

//   addSubscription,
//   deleteById,
//   getById,
//   getSubscription,
//   updateById,
// } from "../controllers/subsctiption.controller";

const router = express.Router();

router.post("/", addLead);
router.get("/", getLead);
router.get("/getLeadsForAdmin", getLeadsForAdmin);
router.get("/getLeadsBycreatedById/:id", getLeadsBycreatedById);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
