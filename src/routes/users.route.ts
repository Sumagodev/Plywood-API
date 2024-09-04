import express from "express";
import {
  ChangeAllManufacturerRoles,
  addUser,
  appLogin,
  approveUserById,
  blockUserById,
  checkForValidSubscription,
  checkForValidSubscriptionAndReturnBoolean,
  deleteUserById,
  getAllSalesReport,
  getAllUsers,
  getAllUsersForWebsite,
  getAllUsersWithAniversaryDate,
  getAllUsersWithSubsciption,
  getSalesUsers,
  getUserById,
  getUserNotifications,
  markedAsReadNotificatins,
  refreshToken,
  registerUser,
  registerUserFcmToken,
  searchVendor,
  sentOtp,
  updateUserById,
  uploadDocuments,
  verifyUserById,
  webLogin,
} from "../controllers/user.contoller";
import { authorizeJwt } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router();

// router.post("/login", loginUser);>

router.post("/login", webLogin);

router.post("/app-login", appLogin);

router.post("/register", registerUser);

router.post("/addUser", authorizeJwt, addUser);

router.patch("/updateUserById/:id", authorizeJwt, updateUserById);

router.get("/searchVendor", searchVendor);
router.get("/getAllUsers", getAllUsers);
router.get("/getAllUsersForWebsite", getAllUsersForWebsite);
router.get("/getAllUsersWithAniversaryDate", getAllUsersWithAniversaryDate);
router.get("/getAllUsersWithSubsciption", authorizeJwt, getAllUsersWithSubsciption);
router.get("/checkForValidSubscription/:id", checkForValidSubscription);
router.get("/checkForValidSubscriptionAndReturnBoolean/:id", checkForValidSubscriptionAndReturnBoolean);

router.get("/getUserById/:userId", getUserById);

router.delete("/deleteUserById/:userId", deleteUserById);

router.patch("/approveUserById/:userId", approveUserById);
router.patch("/verifyUserById/:userId", verifyUserById);
router.patch("/blockUserById/:userId", blockUserById);

router.post("/registerUserFcmToken", registerUserFcmToken);

router.post("/upload-documents/:userId", upload.single("file"), uploadDocuments);

router.post("/sentOtp", sentOtp);

router.post("/refresh-token", refreshToken);


router.get("/getUserNotifications", getUserNotifications)
router.get("/markedAsRead", markedAsReadNotificatins)

router.get("/getSalesUsers", getSalesUsers)
router.get("/ChangeAllManufacturerRoles", ChangeAllManufacturerRoles)
router.get("/getAllSalesReport", getAllSalesReport);
export default router;
