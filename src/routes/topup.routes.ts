import express from "express";
import {

    addTopup,
    deleteById,
    getById,
    getTopup,
    getTopupWithSubscriberCountApi,
    updateById,
} from "../controllers/topup.controller";

const router = express.Router();

router.post("/", addTopup);
router.get("/", getTopup);
router.get("/getTopupWithApi", getTopupWithSubscriberCountApi);
router.get("/getById/:id", getById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);


export default router;
