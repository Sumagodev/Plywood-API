import express from "express";
import {
  addProduct,
  deleteById,
  getAllProductsBySupplierId,
  getById,
  getProduct,
  getProductById,
  getSimilarProducts,
  searchProductWithQuery,
  updateAppById,
  updateById,getTopSellingProducts
} from "../controllers/product.controller";


const router = express.Router();

router.post("/", addProduct);
router.get("/", getProduct);
router.get("/getById/:id", getById);
router.get("/getAllProductsBySupplierId/:id", getAllProductsBySupplierId);
router.get("/getProductById/:id", getProductById);
router.patch("/updateById/:id", updateById);
router.delete("/deleteById/:id", deleteById);
router.get("/getSimilarProducts/:id", getSimilarProducts);
router.get("/searchProductWithQuery", searchProductWithQuery);
router.get('/top-selling', getTopSellingProducts);

router.patch("/updateAppById/:id",updateAppById)
export default router;
