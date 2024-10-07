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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSalesReport = exports.ChangeAllManufacturerRoles = exports.getSalesUsers = exports.markedAsReadNotificatins = exports.getUserNotifications = exports.registerUserFcmToken = exports.getAllUsersWithAniversaryDate = exports.getTopVendors = exports.getAllUsersForWebsite = exports.checkForValidSubscriptionAndReturnBoolean = exports.checkForValidSubscription = exports.verifyUserOTP = exports.checkIfUserIsVerified = exports.sendOTPForVerify = exports.sentOtp = exports.refreshToken = exports.getAllUsersWithSubsciption = exports.searchVendor = exports.getAllUsers = exports.uploadDocuments = exports.blockUserById = exports.verifyUserById = exports.approveUserById = exports.getUserById = exports.deleteUserById = exports.registerUser = exports.updateUserById = exports.addUser = exports.appLogin = exports.webLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = require("../helpers/bcrypt");
const config_1 = require("../helpers/config");
const constant_1 = require("../helpers/constant");
const fileSystem_1 = require("../helpers/fileSystem");
const generators_1 = require("../helpers/generators");
const jwt_1 = require("../helpers/jwt");
const nodemailer_1 = require("../helpers/nodemailer");
const City_model_1 = require("../models/City.model");
const State_model_1 = require("../models/State.model");
const country_model_1 = require("../models/country.model");
const user_model_1 = require("../models/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const UserFcmTokens_model_1 = require("../models/UserFcmTokens.model");
const Notifications_model_1 = require("../models/Notifications.model");
const otp_models_1 = __importDefault(require("../models/otp.models"));
const validiator_1 = require("../helpers/validiator");
const sipCrm_service_1 = require("../service/sipCrm.service");
const date_fns_1 = require("date-fns"); // Use date-fns for date comparison if needed
const OtpVerify_model_1 = __importDefault(require("../models/OtpVerify.model"));
const VerifiedUser_model_1 = __importDefault(require("../models/VerifiedUser.model"));
const sms_1 = require("../helpers/sms");
const webLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const UserExistCheck = yield user_model_1.User.findOne({ $or: [{ email: new RegExp(`^${req.body.email}$`) }] }).exec();
        if (!UserExistCheck) {
            throw new Error(`User Does Not Exist`);
        }
        if (!UserExistCheck.approved) {
            throw new Error(`Please wait while the admins verify you.`);
        }
        const passwordCheck = yield (0, bcrypt_1.comparePassword)(UserExistCheck.password, req.body.password);
        if (!passwordCheck) {
            throw new Error(`Invalid Credentials`);
        }
        let userData = {
            userId: UserExistCheck._id,
            role: UserExistCheck.role,
            user: {
                name: UserExistCheck.name,
                email: UserExistCheck.email,
                phone: UserExistCheck.phone,
                _id: UserExistCheck._id,
            },
        };
        const token = yield (0, jwt_1.generateAccessJwt)(userData);
        const user = yield user_model_1.User.findByIdAndUpdate(UserExistCheck._id, { token: token }, { new: true }).exec();
        const refreshToken = yield (0, jwt_1.generateRefreshJwt)(userData);
        res.status(200).json({ message: "User Logged In", role: userData === null || userData === void 0 ? void 0 : userData.role, token, refreshToken });
    }
    catch (error) {
        next(error);
    }
});
exports.webLogin = webLogin;
const appLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        if (!req.body.otp) {
            throw new Error(`Otp is required`);
        }
        let phone = req.body.phone;
        let verifyOtp = phone.substr(4, phone.length - 1);
        console.log(verifyOtp, verifyOtp);
        let otp = req.body.otp;
        const response = yield otp_models_1.default.find({ phone }).sort({ createdAt: -1 }).limit(1);
        if (response.length === 0 || otp !== response[0].otp) {
            console.log(response, "responseresponseresponse");
            throw new Error("Invalid OTP");
        }
        // if (req.body.otp !== verifyOtp) {
        //   throw new Error(`Invalid OTP`);
        // }
        const UserExistCheck = yield user_model_1.User.findOne({ $or: [{ phone: new RegExp(`^${req.body.phone}$`) }] }).exec();
        if (!UserExistCheck) {
            throw new Error(`User Does Not Exist`);
        }
        if (!UserExistCheck.approved) {
            throw new Error(`Please wait while the admins verify you.`);
        }
        let userData = {
            userId: UserExistCheck._id,
            role: UserExistCheck.role,
            user: {
                name: UserExistCheck.name,
                email: UserExistCheck.email,
                phone: UserExistCheck.phone,
                _id: UserExistCheck._id,
            },
        };
        const token = yield (0, jwt_1.generateAccessJwt)(userData);
        const user = yield user_model_1.User.findByIdAndUpdate(UserExistCheck._id, { token: token }, { new: true }).exec();
        res.status(200).json({ message: "User Logged In", token: token });
    }
    catch (error) {
        next(error);
    }
});
exports.appLogin = appLogin;
const addUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body, "Received Request Body");
        // Log the phone number being checked
        console.log(`Checking if phone ${req.body.phone} is verified`);
        // Check if the phone number exists and is verified in VerifiedUsers
        const verifiedUser = yield VerifiedUser_model_1.default.findOne({ phone: req.body.phone, status: true });
        // Log the result of the verification check
        console.log("Verified user check result:", verifiedUser);
        if (!verifiedUser) {
            console.log("Phone number not verified or not present in VerifiedUsers");
            return res.status(400).json({ message: "Phone number is not verified", success: false });
        }
        console.log("Phone number verified, proceeding with user creation");
        const documents = [];
        if (req.body.gstCertificate) {
            let gstCertificate = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.gstCertificate);
            documents.push({ name: "gstCertificate", image: gstCertificate });
        }
        if (req.body.profileImage && req.body.profileImage.includes("base64")) {
            req.body.profileImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.profileImage);
        }
        if (req.body.bannerImage && req.body.bannerImage.includes("base64")) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        if (documents.length > 0) {
            req.body.documents = documents;
        }
        if (req.body.password) {
            req.body.password = yield (0, bcrypt_1.encryptPassword)(req.body.password);
        }
        if (req.body.salesId) {
            req.body.salesId = new mongoose_1.default.Types.ObjectId(req.body.salesId);
        }
        const user = yield new user_model_1.User(Object.assign(Object.assign({}, req.body), { role: req.body.role })).save();
        res.status(201).json({ message: "User Created", data: user._id, success: true });
    }
    catch (error) {
        console.log("Error in addUser:", error);
        next(error);
    }
});
exports.addUser = addUser;
const updateUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // const UserExistEmailCheck = await User.findOne({
        //   email: new RegExp(`^${req.body.email}$`),
        //   _id: { $ne: req.params.id },
        // }).exec();
        // console.log(UserExistEmailCheck, { email: new RegExp(`^${req.body.email}$`), _id: { $ne: req.params.id } });
        // if (UserExistEmailCheck) {
        //   throw new Error(`User with this email Already Exists`);
        // }
        if (!(0, validiator_1.ValidatePhone)(req.body.phone)) {
            throw new Error("Phone number is not valid !!!!");
        }
        // if(!ValidatePhone(req.body.whatsapp)){
        //   throw new Error("Whatsapp number is not valid !!!!");
        // }
        // if(!ValidateLandline(req.body.landline)){
        //   throw new Error("Landline number is not valid !!!!");
        // }
        // if(req.body?.companyObj?.phone && !ValidatePhone(req.body?.companyObj?.phone)){
        //   throw new Error("Company Phone Number is not valid !!!!");
        // }
        if (((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.companyObj) === null || _b === void 0 ? void 0 : _b.email) && !(0, validiator_1.ValidateEmail)((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.companyObj) === null || _d === void 0 ? void 0 : _d.email)) {
            throw new Error("Email address is not valid !!!!");
        }
        const UserExistPhoneCheck = yield user_model_1.User.findOne({
            phone: req.body.phone,
            _id: { $ne: req.params.id },
        }).exec();
        console.log(UserExistPhoneCheck, "UserExistPhoneCheck");
        if (UserExistPhoneCheck) {
            throw new Error(`User with this phone Already Exists`);
        }
        const documents = [];
        if (req.body.gstCertificate && req.body.gstCertificate.includes("base64")) {
            let gstCertificate = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.gstCertificate);
            documents.push({ name: "gstCertificate", image: gstCertificate });
        }
        else {
            delete req.body.gstCertificate;
        }
        if (req.body.imagesArr && req.body.imagesArr.length) {
            for (const el of req.body.imagesArr) {
                if (req.body.imagesArr && req.body.imagesArr.length > 5) {
                    throw new Error("You cannot add more than 5 images");
                }
                if (el.image && el.image.includes("base64")) {
                    el.image = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(el.image);
                }
            }
        }
        if (req.body.videoArr && req.body.videoArr.length) {
            for (const el of req.body.videoArr) {
                if (req.body.videoArr && req.body.videoArr.length > 5) {
                    throw new Error("You cannot add more than 5 videos");
                }
                if (el.video && el.video.includes("base64")) {
                    el.video = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(el.video);
                }
            }
        }
        if (req.body.profileImage && req.body.profileImage.includes("base64")) {
            req.body.profileImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.profileImage);
        }
        if (req.body.bannerImage && req.body.bannerImage.includes("base64")) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        if (documents.length > 0) {
            req.body.documents = documents;
        }
        if (req.body.salesId) {
            req.body.salesId = yield new mongoose_1.default.Types.ObjectId(req.body.salesId);
        }
        yield user_model_1.User.findByIdAndUpdate(req.params.id, req.body).exec();
        res.status(201).json({ message: "Your profile is updated", success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserById = updateUserById;
const registerUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    try {
        console.log(req.body);
        // const UserExistEmailCheck = await User.findOne({
        //   email: new RegExp(`^${req.body.email}$`),
        // }).exec();
        // if (UserExistEmailCheck) {
        //   throw new Error(`User with this email Already Exists`);
        // }
        if (!(0, validiator_1.ValidatePhone)(req.body.phone)) {
            throw new Error("Phone number is not valid !!!!");
        }
        // if(!ValidatePhone(req.body.whatsapp)){
        //   throw new Error("Whatsapp number is not valid !!!!");
        // }
        // if(!ValidateLandline(req.body.landline)){
        //   throw new Error("Landline number is not valid !!!!");
        // }
        // if(req.body?.companyObj?.phone && !validMobileNo(req.body?.companyObj?.phone)){
        //   throw new Error("Company Phone Number is not valid !!!!");
        // }
        console.log((_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.companyObj) === null || _f === void 0 ? void 0 : _f.email, "req.body.email");
        if (((_h = (_g = req.body) === null || _g === void 0 ? void 0 : _g.companyObj) === null || _h === void 0 ? void 0 : _h.email) && !(0, validiator_1.ValidateEmail)((_k = (_j = req.body) === null || _j === void 0 ? void 0 : _j.companyObj) === null || _k === void 0 ? void 0 : _k.email)) {
            throw new Error("Email address is not valid !!!!");
        }
        if ((_l = req.body) === null || _l === void 0 ? void 0 : _l.email) {
            if (!(0, validiator_1.ValidateEmail)((_m = req.body) === null || _m === void 0 ? void 0 : _m.email)) {
                throw new Error("Email address is not valid !!!!");
            }
        }
        else {
            req.body.email = (_p = (_o = req.body) === null || _o === void 0 ? void 0 : _o.companyObj) === null || _p === void 0 ? void 0 : _p.email;
        }
        const UserExistPhoneCheck = yield user_model_1.User.findOne({
            phone: req.body.phone,
        }).exec();
        if (UserExistPhoneCheck) {
            throw new Error(`User with this phone Already Exists`);
        }
        if (req.body.profileImage && req.body.profileImage.includes("base64")) {
            req.body.profileImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.profileImage);
        }
        if (req.body.bannerImage && req.body.bannerImage.includes("base64")) {
            req.body.bannerImage = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.bannerImage);
        }
        if (req.body.password) {
            req.body.password = yield (0, bcrypt_1.encryptPassword)(req.body.password);
        }
        else {
            req.body.password = yield (0, bcrypt_1.encryptPassword)(((_q = req === null || req === void 0 ? void 0 : req.body) === null || _q === void 0 ? void 0 : _q.name) + "1234");
        }
        const documents = [];
        if (req.body.gstCertificate) {
            const gstCertificate = yield (0, fileSystem_1.storeFileAndReturnNameBase64)(req.body.gstCertificate);
            documents.push({ name: "gstCertificate", image: gstCertificate });
        }
        if (documents.length > 0) {
            req.body.documents = documents;
        }
        let user = yield new user_model_1.User(req.body).save();
        if (user && (user === null || user === void 0 ? void 0 : user._id)) {
            let email = (user === null || user === void 0 ? void 0 : user.email) ? user === null || user === void 0 ? void 0 : user.email : (_r = user === null || user === void 0 ? void 0 : user.companyObj) === null || _r === void 0 ? void 0 : _r.email;
            let name = user === null || user === void 0 ? void 0 : user.name;
            let emailArr = [
                {
                    name,
                    email,
                },
            ];
            let customerTitle = `Thank you for registering`;
            // await sendMail2(emailArr, `${user._id}`, customerTitle,user);
            let crmObj = {
                PersonName: user === null || user === void 0 ? void 0 : user.name,
                MobileNo: user === null || user === void 0 ? void 0 : user.phone,
                EmailID: user === null || user === void 0 ? void 0 : user.email,
                CompanyName: `${(_s = user === null || user === void 0 ? void 0 : user.companyObj) === null || _s === void 0 ? void 0 : _s.name}`,
                OfficeAddress: `${user === null || user === void 0 ? void 0 : user.address}`,
                MediumName: "Register",
                Country: "",
                State: "",
                City: "",
                SourceName: "app",
            };
            if ((_t = req.body) === null || _t === void 0 ? void 0 : _t.SourceName) {
                crmObj.SourceName = (_u = req.body) === null || _u === void 0 ? void 0 : _u.SourceName;
            }
            if (user.countryId) {
                let countryObj = yield country_model_1.Country.findById(user.countryId).exec();
                crmObj.Country = (countryObj === null || countryObj === void 0 ? void 0 : countryObj.name) ? countryObj === null || countryObj === void 0 ? void 0 : countryObj.name : "";
            }
            if (user.stateId) {
                let stateObj = yield State_model_1.State.findById(user.stateId).exec();
                crmObj.State = (stateObj === null || stateObj === void 0 ? void 0 : stateObj.name) ? stateObj === null || stateObj === void 0 ? void 0 : stateObj.name : "";
            }
            if (user.cityId) {
                let cityObj = yield City_model_1.City.findById(user.cityId).exec();
                crmObj.City = (cityObj === null || cityObj === void 0 ? void 0 : cityObj.name) ? cityObj === null || cityObj === void 0 ? void 0 : cityObj.name : "";
            }
            yield (0, sipCrm_service_1.postSpiCrmLead)(crmObj);
        }
        let userData = {
            userId: user._id,
            role: user.role,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                _id: user._id,
            },
        };
        const token = yield (0, jwt_1.generateAccessJwt)(userData);
        let userObj = yield user_model_1.User.findByIdAndUpdate(user._id, { token: token }, { new: true }).exec();
        res.status(201).json({ message: "Registered", data: user._id, token });
    }
    catch (error) {
        next(error);
    }
});
exports.registerUser = registerUser;
const deleteUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByIdAndDelete(req.params.userId).exec();
        res.status(201).json({ message: "User deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUserById = deleteUserById;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _v;
    try {
        let user = yield user_model_1.User.findById(req.params.userId).lean().exec();
        console.log(user, "user");
        if (!user)
            throw new Error("User Not Found");
        if (user.countryId) {
            user.countryObj = yield country_model_1.Country.findById(user.countryId).exec();
        }
        if (user.stateId) {
            user.stateObj = yield State_model_1.State.findById(user.stateId).exec();
        }
        if (user.cityId) {
            user.cityObj = yield City_model_1.City.findById(user.cityId).exec();
        }
        let today = new Date();
        today.setHours(23, 59, 59);
        let expiry = new Date(user.subscriptionEndDate);
        expiry.setHours(23, 59, 59);
        let userSubscriptionExpired = true;
        if (user.subscriptionEndDate && today.getTime() <= expiry.getTime()) {
            userSubscriptionExpired = false;
        }
        else {
            userSubscriptionExpired = true;
        }
        user.userSubscriptionExpired = userSubscriptionExpired;
        // let userSubscriptionObj: any = await UserSubscription.findOne({ userId: req.params.userId }).sort({ createdAt: -1 }).exec()
        // console.log(userSubscriptionObj, "userSubscriptionObj?.endDate")
        // if (userSubscriptionObj) {
        //   user.userSubscriptionMessage = `Your current subscription will be expire on ${new Date(userSubscriptionObj?.endDate).toDateString()}`
        // }
        // else {
        //   user.userSubscriptionMessage = `You do not have any subscription currently active`
        // }
        res.status(201).json({ message: "User Found", data: user });
        let visitorUserId = req.query.visitorUserId;
        if (Array.isArray(visitorUserId)) {
            visitorUserId = visitorUserId[0]; // Use the first element if an array
        }
        if (Array.isArray(visitorUserId)) {
            visitorUserId = visitorUserId[0]; // Use the first element if an array
        }
        if (visitorUserId && mongoose_1.default.Types.ObjectId.isValid(visitorUserId)) {
            // Fetch the user who accessed the profile
            let leadUser = yield user_model_1.User.findById(visitorUserId).lean().exec();
            if (!leadUser)
                throw new Error("Lead User Not Found");
            // Define the current day range (start and end of today)
            const startOfToday = (0, date_fns_1.startOfDay)(new Date());
            const endOfToday = (0, date_fns_1.endOfDay)(new Date());
            console.log('Profile Owner ID:', req.params.userId);
            console.log('Visitor User ID:', visitorUserId);
            console.log('Start of Today:', startOfToday);
            console.log('End of Today:', endOfToday);
            // Check if a notification already exists for the same user and day
            let existingNotification = yield Notifications_model_1.Notifications.findOne({
                userId: req.params.userId,
                type: 'profile_view',
                createdAt: {
                    $gte: startOfToday,
                    $lte: endOfToday // Less than or equal to the end of the day
                },
                'payload.accessedBy': visitorUserId // Check for the accessedBy field
            });
            console.log('Existing Notification:', existingNotification);
            if (existingNotification) {
                // If a notification exists, increment the view count and update the last access time
                yield Notifications_model_1.Notifications.updateOne({ _id: existingNotification._id }, {
                    $inc: { viewCount: 1 },
                    $set: {
                        lastAccessTime: new Date(),
                        isRead: false,
                    } // Update lastAccessTime to current time
                });
                console.log('Notification updated with incremented view count and updated last access time');
            }
            else {
                // If no notification exists, create a new one
                const newNotification = new Notifications_model_1.Notifications({
                    userId: req.params.userId,
                    type: 'profile_view',
                    title: 'Your profile was accessed',
                    content: `Your profile was accessed by user ${visitorUserId}`,
                    sourceId: visitorUserId,
                    isRead: false,
                    viewCount: 1,
                    lastAccessTime: new Date(),
                    payload: {
                        accessedBy: visitorUserId,
                        accessTime: new Date(),
                        organizationName: ((_v = leadUser === null || leadUser === void 0 ? void 0 : leadUser.companyObj) === null || _v === void 0 ? void 0 : _v.name) || 'Unknown' // Safely access company name
                    }
                });
                // Save the new notification to the database
                try {
                    yield newNotification.save();
                    console.log('New notification created with viewCount and lastAccessTime');
                }
                catch (error) {
                    console.error('Error saving new notification:', error);
                }
            }
        }
        else {
            console.error('Invalid Visitor User ID:', visitorUserId);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getUserById = getUserById;
const approveUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let status = req.body.status;
        const user = yield user_model_1.User.findByIdAndUpdate(req.params.userId, { approved: status }, { new: true }).exec();
        res.status(201).json({ message: "User Approval status changed", data: user });
    }
    catch (error) {
        next(error);
    }
});
exports.approveUserById = approveUserById;
const verifyUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByIdAndUpdate(req.params.userId, { isVerified: req.body.isVerified }, { new: true }).exec();
        res.status(201).json({ message: "User Verification status changed", data: user });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyUserById = verifyUserById;
const blockUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findByIdAndUpdate(req.params.userId, { isBlocked: req.body.isBlocked }, { new: true }).exec();
        res.status(201).json({ message: "User Subscription Block status changed", data: user });
    }
    catch (error) {
        next(error);
    }
});
exports.blockUserById = blockUserById;
const uploadDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _w;
    try {
        if (!req.file) {
            throw new Error("Error Uploading File");
        }
        const userObj = yield user_model_1.User.findByIdAndUpdate(req.params.userId, {
            $push: { documents: { fileName: (_w = req.file) === null || _w === void 0 ? void 0 : _w.filename } },
        }).exec();
        if (!userObj) {
            throw new Error(`User does not exist`);
        }
        res.json({ message: "Image Uploaded", data: req.file.filename });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadDocuments = uploadDocuments;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _x;
    try {
        let userObj = yield user_model_1.User.findById((_x = req.user) === null || _x === void 0 ? void 0 : _x.userId).exec();
        let query = { $and: [{ role: { $ne: constant_1.ROLES.ADMIN } }] };
        if (userObj && userObj.role) {
            if (userObj.role !== constant_1.ROLES.ADMIN) {
                query.$and.push({ role: { $ne: userObj === null || userObj === void 0 ? void 0 : userObj.role } });
            }
            if (userObj.role === constant_1.ROLES.FIELDUSER) {
                query.$and.push({ role: { $ne: constant_1.ROLES.SUBADMIN } });
            }
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { $or: [{ name: new RegExp(`${req.query.q}`, "i") }, { email: new RegExp(`${req.query.q}`, "i") }] });
        }
        if (req.query.role && `${req.query.role}`.toLowerCase() != "all") {
            query = Object.assign(Object.assign({}, query), { role: req.query.role });
        }
        if (req.query.status && req.query.status != "") {
            query = Object.assign(Object.assign({}, query), { approved: req.query.status == "active" ? true : false });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        let totalCount = yield user_model_1.User.find(query).countDocuments();
        let totalUsers = yield user_model_1.User.find({ role: { $ne: constant_1.ROLES.ADMIN } }).countDocuments();
        let totalDistributors = yield user_model_1.User.find({ role: constant_1.ROLES.DISTRIBUTOR }).countDocuments();
        let totalManufacturers = yield user_model_1.User.find({ role: constant_1.ROLES.MANUFACTURER }).countDocuments();
        let totalDealers = yield user_model_1.User.find({ role: constant_1.ROLES.DEALER }).countDocuments();
        console.log(query, "userObj.role === ROLES.FIELDUSER &&");
        let users = yield user_model_1.User.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue).
            sort({ createdAt: -1 })
            .lean()
            .exec();
        if (!(req.query.showName && req.query.showName != "" && req.query.showName == "true")) {
            for (const user of users) {
                if (user.countryId) {
                    user.countryObj = yield country_model_1.Country.findById(user.countryId).exec();
                }
                if (user.stateId) {
                    user.sateObj = yield State_model_1.State.findById(user.stateId).exec();
                }
                if (user.cityId) {
                    user.cityObj = yield City_model_1.City.findById(user.cityId).exec();
                }
            }
        }
        res.json({
            message: "ALL Users",
            data: users,
            totalCount: totalCount,
            totalDistributors,
            totalManufacturers,
            totalDealers,
            totalUsers,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
const searchVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query, "query");
        let query = {};
        if (req.query.search) {
            console.log(req.query.search, "req.query.search");
            query = {
                $or: [
                    { "companyObj.name": new RegExp(`${req.query.search}`, "i") },
                    { "name": new RegExp(`${req.query.search}`, "i") },
                    { "productsIdArr.name": new RegExp(`${req.query.search}`, "i") },
                    { "productsIdArr.createdByObj.name": new RegExp(`${req.query.search}`, "i") },
                    { "productsIdArr.specification.grade": new RegExp(`${req.query.search}`, "i") },
                    { "productsIdArr.shortDescription": new RegExp(`${req.query.search}`, "i") },
                    { "productsIdArr.longDescription": new RegExp(`${req.query.search}`, "i") },
                    { "brandNames": new RegExp(`${req.query.search}`, "i") },
                    { "brandArr.name": new RegExp(`${req.query.search}`, "i") },
                    { "stateId": new RegExp(`${req.query.search}`, "i") },
                    { "categoryId": new RegExp(`${req.query.search}`, "i") }
                ],
            };
        }
        let roleArr = ["ADMIN"];
        if (req.query.role && req.query.role != "" && req.query.role != null) {
            roleArr.push(`${req.query.role}`);
        }
        let pipeline = [
            {
                "$match": {
                    "role": {
                        "$nin": roleArr,
                    },
                },
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "_id",
                    "foreignField": "createdById",
                    "pipeline": [
                        {
                            "$match": {
                                "approved": "APPROVED",
                            },
                        },
                    ],
                    "as": "productsArr",
                },
            },
            {
                "$unwind": {
                    "path": "$productsArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$addFields": {
                    "brandId": {
                        "$cond": {
                            "if": {
                                "$and": [
                                    {
                                        "$ifNull": ["$productsArr.brand", false],
                                    },
                                    {
                                        "$ne": ["$productsArr.brand", ""],
                                    },
                                ],
                            },
                            "then": {
                                "$toObjectId": "$productsArr.brand",
                            },
                            "else": null,
                        },
                    },
                },
            },
            {
                "$lookup": {
                    "from": "brands",
                    "localField": "brandId",
                    "foreignField": "_id",
                    "as": "brandObj",
                },
            },
            {
                "$unwind": {
                    "path": "$brandObj",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$addFields": {
                    "brandName": "$brandObj.name",
                },
            },
            {
                "$unwind": {
                    "path": "$productsArr.categoryArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$group": {
                    "_id": "$_id",
                    "name": {
                        "$first": "$name",
                    },
                    "role": {
                        "$first": "$role",
                    },
                    // 'bannerImage': {
                    //   '$first': '$bannerImage'
                    // },
                    // 'profileImage': {
                    //   '$first': '$profileImage'
                    // },
                    "productsIdArr": {
                        "$addToSet": "$productsArr",
                    },
                    "brandNames": {
                        "$addToSet": "$brandNames",
                    },
                    "companyObj": {
                        "$first": "$companyObj",
                    },
                    "stateId": {
                        "$first": "$stateId",
                    },
                    "categoryId": {
                        "$first": "$categoryId",
                    },
                    "brandArr": {
                        "$addToSet": {
                            "name": "$brandName",
                        },
                    },
                },
            },
            {
                "$match": query,
            },
            {
                "$project": {
                    "_id": 1,
                    "name": 1,
                    "role": 1,
                    "companyObj.name": 1,
                },
            },
        ];
        console.log(JSON.stringify(pipeline, null, 2), "pipeline");
        let users = yield user_model_1.User.aggregate(pipeline);
        console.log("USERS", users, "USERS2");
        // let users: any = await User.find(query).select({ _id: 1, name: 1, companyObj: 1 }).lean()
        //   .exec();
        res.json({
            message: "ALL Users",
            data: users,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchVendor = searchVendor;
const getAllUsersWithSubsciption = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query, "query");
        let ogPipeline = [
            {
                "$match": {
                    "role": {
                        "$ne": "ADMIN",
                    },
                },
            },
            {
                "$addFields": {
                    "userId": {
                        "$toString": "$_id",
                    },
                },
            },
            {
                "$lookup": {
                    "from": "usersubscriptions",
                    "localField": "userId",
                    "foreignField": "userId",
                    "as": "userSubscriptionArr",
                },
            },
            {
                "$project": {
                    "_id": 1,
                    "name": 1,
                    "email": 1,
                    "phone": 1,
                    "whatsapp": 1,
                    "password": 1,
                    "address": 1,
                    "dob": 1,
                    "companyObj": 1,
                    "role": 1,
                    "approved": 1,
                    "accessObj": 1,
                    "documents": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "cityId": 1,
                    "countryId": 1,
                    "stateId": 1,
                    "token": 1,
                    "userId": 1,
                    "userSubscriptionArr": 1,
                    "userSubscriptionCount": {
                        "$reduce": {
                            "input": "$userSubscriptionArr",
                            "initialValue": 0,
                            "in": {
                                "$cond": [
                                    {
                                        "$ne": ["$$this", {}],
                                    },
                                    {
                                        "$add": ["$$value", 1],
                                    },
                                    "$$value",
                                ],
                            },
                        },
                    },
                },
            },
            {
                "$match": {
                    "userSubscriptionCount": {
                        "$gt": 0,
                    },
                },
            },
            {
                "$count": "total",
            },
        ];
        let pipeline = [
            {
                "$match": {
                    "role": {
                        "$ne": "ADMIN",
                    },
                },
            },
            {
                "$addFields": {
                    "userId": {
                        "$toString": "$_id",
                    },
                },
            },
            {
                "$lookup": {
                    "from": "usersubscriptions",
                    "localField": "userId",
                    "foreignField": "userId",
                    "as": "userSubscriptionArr",
                },
            },
            {
                "$project": {
                    "_id": 1,
                    "name": 1,
                    "email": 1,
                    "phone": 1,
                    "whatsapp": 1,
                    "password": 1,
                    "address": 1,
                    "dob": 1,
                    "companyObj": 1,
                    "role": 1,
                    "approved": 1,
                    "accessObj": 1,
                    "documents": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "cityId": 1,
                    "countryId": 1,
                    "stateId": 1,
                    "token": 1,
                    "userId": 1,
                    "userSubscriptionArr": 1,
                    "userSubscriptionCount": {
                        "$reduce": {
                            "input": "$userSubscriptionArr",
                            "initialValue": 0,
                            "in": {
                                "$cond": [
                                    {
                                        "$ne": ["$$this", {}],
                                    },
                                    {
                                        "$add": ["$$value", 1],
                                    },
                                    "$$value",
                                ],
                            },
                        },
                    },
                },
            },
            {
                "$match": {
                    "userSubscriptionCount": {
                        "$gt": 0,
                    },
                },
            },
        ];
        let query = {};
        if (req.query.q) {
            query["$or"] = [{ name: new RegExp(`${req.query.q}`, "i") }, { email: new RegExp(`${req.query.q}`, "i") }];
        }
        if (req.query.startDate) {
            query = Object.assign(Object.assign({}, query), { createdAt: { $gte: req.query.startDate, $lte: req.query.endDate } });
        }
        if (query) {
            pipeline.push({
                "$match": query,
            });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        if (pageValue) {
            pipeline.push({
                "$skip": (pageValue - 1) * limitValue,
            });
        }
        if (limitValue) {
            pipeline.push({
                "$limit": limitValue,
            });
        }
        let totalCount = yield user_model_1.User.aggregate(ogPipeline).exec();
        console.log(totalCount[0].total, "totalCount");
        let users = yield user_model_1.User.aggregate(pipeline).exec();
        res.json({ message: "ALL Users with subscription", data: users, totalCounts: totalCount[0].total });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsersWithSubsciption = getAllUsersWithSubsciption;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.refreshToken)
            throw new Error(`Refresh Token is required`);
        let token = req.body.refreshToken;
        const decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_ACCESS_REFRESH_TOKEN_SECRET);
        // Add user from payload
        req.user = decoded;
        if (req.user) {
            const UserExistCheck = yield user_model_1.User.findById(decoded.userId).exec();
            if (!UserExistCheck) {
                throw new Error(`User Does Not Exist`);
            }
            let userData = {
                userId: UserExistCheck._id,
                role: UserExistCheck.role,
                user: {
                    name: UserExistCheck.name,
                    email: UserExistCheck.email,
                    phone: UserExistCheck.phone,
                    _id: UserExistCheck._id,
                },
            };
            token = yield (0, jwt_1.generateAccessJwt)({ userData });
            const refreshToken = yield (0, jwt_1.generateRefreshJwt)({ userData });
            res.status(200).json({ message: "Refresh Token", token: token, refreshToken: refreshToken });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
const sentOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let findArr = [];
        if (req.body.email && req.body.email != "") {
            findArr.push({ email: new RegExp(`^${req.body.email}$`, "i") });
        }
        if (req.body.phone && req.body.phone != "") {
            findArr.push({ phone: new RegExp(`^${req.body.phone}$`, "i") });
        }
        const UserExistCheck = yield user_model_1.User.findOne({ $or: findArr }).exec();
        if (!UserExistCheck) {
            throw new Error(`User Does Not Exist`);
        }
        let otp = (0, generators_1.generateRandomNumber)(6);
        if (req.body.phone == "9000000000") {
            otp = "123456";
        }
        if (req.body.phone && req.body.phone != "") {
            const otpPayload = { phone: req.body.phone, otp };
            const otpBody = yield otp_models_1.default.create(otpPayload);
        }
        if (req.body.email && req.body.email != "") {
            yield (0, nodemailer_1.sendMail)(UserExistCheck.email, otp);
        }
        console.log(UserExistCheck, "UserExistCheck");
        console.log("w");
        res.status(200).json({ message: "OTP send to your mobile " + req.body.phone });
    }
    catch (error) {
        next(error);
    }
});
exports.sentOtp = sentOtp;
const sendOTPForVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const phone = req.body.phone;
        // Validate the phone number
        const phoneRegex = /^[6-9]\d{9}$/; // Regex for 10-digit numbers starting with 6-9
        if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone)) {
            return res.status(400).json({ result: false, message: "Invalid phone number. It must be a 10-digit number starting with 6-9." });
        }
        let otp = (0, generators_1.generateRandomNumber)(6);
        if (phone === "9000000000") {
            otp = "123456";
        }
        const otpPayload = { phone, otp };
        const otpObj = yield OtpVerify_model_1.default.create(otpPayload);
        if (otpObj) {
            const result = yield (0, sms_1.SendVerificationSMS)(req.body.phone, otp);
            if (result)
                res.status(200).json({ result: true, message: `OTP sent to your mobile ${phone}` });
            else
                res.status(500).json({ result: false, message: `OTP sending failed for your mobile ${phone}` });
        }
        else {
            res.status(500).json({ result: false, message: `OTP sending failed for your mobile ${phone}` });
        }
    }
    catch (error) {
        res.status(500).json({ result: false, message: `OTP sending failed` });
        next(error);
    }
});
exports.sendOTPForVerify = sendOTPForVerify;
const checkIfUserIsVerified = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const phone = req.body.phone;
        // Validate the phone number
        const phoneRegex = /^[6-9]\d{9}$/; // Regex for 10-digit numbers starting with 6-9
        if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone)) {
            return res.status(400).json({ result: false, message: "Invalid phone number. It must be a 10-digit number starting with 6-9." });
        }
        // Check if the phone number exists in the VerifiedUsers collection
        const verifiedUser = yield VerifiedUser_model_1.default.findOne({ phone });
        if (!verifiedUser || !verifiedUser.status) {
            return res.status(404).json({
                result: false,
                message: "Phone number not found or user is not verified.",
            });
        }
        res.status(200).json({ result: true, message: `OTP sent to your mobile ${phone}` });
    }
    catch (error) {
        res.status(500).json({ result: false, message: `OTP sending failed` });
        next(error);
    }
});
exports.checkIfUserIsVerified = checkIfUserIsVerified;
const verifyUserOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const phone = req.body.phone;
        const otp = req.body.otp;
        // Validate the phone number
        const phoneRegex = /^[6-9]\d{9}$/; // Regex for 10-digit numbers starting with 6-9
        if (!phone || typeof phone !== 'string' || !phoneRegex.test(phone)) {
            return res.status(400).json({ result: false, message: "Invalid phone number. It must be a 10-digit number starting with 6-9." });
        }
        // Validate OTP
        if (!otp) {
            return res.status(400).json({ result: false, message: "OTP is required." });
        }
        const response = yield OtpVerify_model_1.default.find({ phone }).sort({ createdAt: -1 }).limit(1);
        // Check if OTP exists and is valid
        if (response.length === 0 || otp !== response[0].otp) {
            return res.status(400).json({ result: false, message: "Invalid OTP." });
        }
        let verifiedUser = yield VerifiedUser_model_1.default.findOne({ phone });
        if (verifiedUser) {
            verifiedUser.verifiedAt = new Date(); // Update the verification date
            verifiedUser.status = true; // Set status to true
            yield verifiedUser.save();
        }
        else {
            verifiedUser = new VerifiedUser_model_1.default({
                phone,
                verifiedAt: new Date(),
                status: true,
            });
            yield verifiedUser.save();
        }
        // Successful verification response
        return res.status(200).json({ result: true, message: "User verification successful" });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyUserOTP = verifyUserOTP;
const checkForValidSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userObj = yield user_model_1.User.findOne({ _id: req.params.id }).exec();
        if (!userObj) {
            throw new Error(`User Does Not Exist`);
        }
        if (!(userObj === null || userObj === void 0 ? void 0 : userObj.subscriptionEndDate)) {
            throw new Error("You do not have a valid subscription to create a lead.");
        }
        let subscriptionEndDate = new Date(userObj === null || userObj === void 0 ? void 0 : userObj.subscriptionEndDate);
        let currentDate = new Date();
        if (subscriptionEndDate.getTime() < currentDate.getTime()) {
            throw new Error("You do not have a valid subscription to create a lead.");
        }
        res.status(200).json({ message: `User have a valid subscription` });
    }
    catch (error) {
        next(error);
    }
});
exports.checkForValidSubscription = checkForValidSubscription;
const checkForValidSubscriptionAndReturnBoolean = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let validSubscription = false;
        const userObj = yield user_model_1.User.findOne({ _id: req.params.id }).exec();
        if (!userObj) {
            throw new Error(`User Does Not Exist`);
        }
        console.log(userObj, "checkForValidSubscriptionAndReturnBoolean");
        let subscriptionEndDate = new Date(userObj === null || userObj === void 0 ? void 0 : userObj.subscriptionEndDate);
        let currentDate = new Date();
        if (subscriptionEndDate.getTime() > currentDate.getTime()) {
            validSubscription = true;
        }
        if (userObj === null || userObj === void 0 ? void 0 : userObj.isBlocked) {
            validSubscription = false;
        }
        console.log(validSubscription, "validSubscription");
        res.status(200).json({ message: `User have a valid subscription`, data: validSubscription });
    }
    catch (error) {
        next(error);
    }
});
exports.checkForValidSubscriptionAndReturnBoolean = checkForValidSubscriptionAndReturnBoolean;
const getAllUsersForWebsite = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query, "query");
        let query = {};
        if (req.query.userId) {
            query.createdById = req.query.userId;
        }
        if (req.query.searchQuery) {
            let regex = new RegExp(`${req.query.searchQuery}`, "i");
            const rangeQuery = [
                {
                    name: regex,
                },
                {
                    companyName: regex,
                },
            ];
            query = Object.assign(Object.assign({}, query), { $or: rangeQuery });
        }
        if (req.query.q) {
            // query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
            let regex = new RegExp(`${req.query.q}`, "i");
            const rangeQuery = [
                {
                    name: regex,
                },
                {
                    companyName: regex,
                },
            ];
            query = Object.assign(Object.assign({}, query), { $or: rangeQuery });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let mainRoleQuery = {};
        if (req.query.role && req.query.role != null && req.query.role != "null") {
            mainRoleQuery = Object.assign(Object.assign({}, mainRoleQuery), { "role": { $ne: req.query.role } });
        }
        if (req.query.userTypes) {
            let userTypesArr = `${req.query.userTypes}`.split(",").filter((el) => el != "");
            query = Object.assign(Object.assign({}, query), { "role": { $in: [...userTypesArr.map((el) => new RegExp(el, "i"))] } });
        }
        if (req.query.category) {
            query = Object.assign(Object.assign({}, query), { "categoryIdArr.categoryId": req.query.category });
        }
        if (req.query.categories) {
            let categoryArr = `${req.query.categories}`.split(",");
            query = Object.assign(Object.assign({}, query), { $or: [
                    { "categoryIdArr.categoryId": { $in: [...categoryArr] } },
                    { "categoryArr.categoryId": { $in: [...categoryArr.map((el) => new mongoose_1.default.Types.ObjectId(el))] } },
                ] });
        }
        if (req.query.locations) {
            let locationArr = `${req.query.locations}`.split(",");
            query = Object.assign(Object.assign({}, query), { "cityId": { $in: [...locationArr] } });
        }
        if (req.query.state) {
            let locationArr = `${req.query.state}`.split(",");
            query = Object.assign(Object.assign({}, query), { "stateId": { $in: [...locationArr] } });
        }
        // if (req.query.city) {
        //   let locationArr = `${req.query.city}`.split(",");
        //   query = { ...query, "state": { $in: [...locationArr] } };
        // }
        if (req.query.rating) {
            let ratingValue = +req.query.rating;
            query = Object.assign(Object.assign({}, query), { "rating": { $gte: ratingValue } });
        }
        if (req.query.vendors) {
            let vendorArr = `${req.query.vendors}`.split(",");
            query = Object.assign(Object.assign({}, query), { $or: vendorArr.map((el) => ({ "brandIdArr.brandId": el })) });
        }
        console.log(query, "query");
        const pipeline = [
            {
                "$match": {
                    $and: [
                        { "role": { "$ne": constant_1.ROLES.SALES } },
                        { "role": { "$ne": constant_1.ROLES.ADMIN } },
                        { "role": { "$ne": constant_1.ROLES.FIELDUSER } },
                    ],
                },
            },
            {
                "$match": mainRoleQuery,
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "_id",
                    "foreignField": "createdById",
                    "pipeline": [
                        {
                            "$match": {
                                "approved": "APPROVED",
                            },
                        },
                    ],
                    "as": "productsArr",
                },
            },
            {
                "$addFields": {
                    "productsCount": {
                        "$size": "$productsArr",
                    },
                },
            },
            {
                "$lookup": {
                    "from": "states",
                    "localField": "stateId",
                    "foreignField": "_id",
                    "as": "stateInfo",
                },
            },
            {
                "$addFields": {
                    "productsCount": {
                        "$size": "$productsArr",
                    },
                    "stateName": {
                        "$arrayElemAt": ["$stateInfo.name", 0],
                    },
                },
            },
            {
                "$unwind": {
                    "path": "$productsArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$unwind": {
                    "path": "$productsArr.categoryArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$group": {
                    "_id": "$_id",
                    "name": {
                        "$first": "$name",
                    },
                    "phone": {
                        "$first": "$phone",
                    },
                    "address": {
                        "$first": "$address",
                    },
                    "companyName": {
                        "$first": "$companyObj.name",
                    },
                    "bannerImage": {
                        "$first": "$bannerImage",
                    },
                    "productsCount": {
                        "$first": "$productsCount",
                    },
                    "profileImage": {
                        "$first": "$profileImage",
                    },
                    "stateName": {
                        // "$first":  {"$arrayElemAt": ["$stateInfo.name", 0]}
                        "$addToSet": {
                            "stateName": "stateInfo.name",
                        },
                    },
                    "categoryIdArr": {
                        "$addToSet": {
                            "categoryId": {
                                "$toString": "$productsArr.categoryArr.categoryId",
                            },
                        },
                    },
                    "categoryArr": {
                        $first: "$categoryArr",
                    },
                    "brandIdArr": {
                        "$addToSet": {
                            "brandId": "$productsArr.brand",
                        },
                    },
                    "countryId": {
                        "$first": "$countryId",
                    },
                    "stateId": {
                        "$first": "$stateId",
                    },
                    "cityId": {
                        "$first": "$cityId",
                    },
                    "role": {
                        "$first": "$role",
                    },
                    "rating": {
                        "$first": "$rating",
                    },
                    "createdByObj": {
                        "$first": {
                            "role": "$productsArr.createdByObj.role",
                        },
                    },
                },
            },
            {
                "$match": Object.assign({}, query),
            },
            {
                "$sort": {
                    "name": 1,
                },
            },
            // {
            //   $skip: (pageValue - 1) * limitValue,
            // },
            // {
            //   $limit: limitValue,
            // },
        ];
        // {
        //   '$match': {
        //     'role': {
        //       '$ne': 'ADMIN'
        //     },
        //     ...query,
        //   }
        // },
        // let query: any = { $and: [{ role: { $ne: ROLES.ADMIN } }] };
        let totalPipeline = [...pipeline];
        totalPipeline.push({
            $count: "count",
        });
        pipeline.push({
            $skip: (pageValue - 1) * limitValue,
        });
        pipeline.push({
            $limit: limitValue,
        });
        let users = yield user_model_1.User.aggregate(pipeline);
        console.log(JSON.stringify(totalPipeline, null, 2), "asd");
        let totalUsers = yield user_model_1.User.aggregate(totalPipeline);
        console.log(totalUsers, "totalUsers");
        totalUsers = totalUsers.length > 0 ? totalUsers[0].count : 0;
        const totalPages = Math.ceil(totalUsers / limitValue);
        // console.log(JSON.stringify(users, null, 2))
        res.json({ message: "ALL Users", data: users, total: totalPages });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsersForWebsite = getAllUsersForWebsite;
// export const getAllUsersForWebsite = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log(req.query, "query");
//     let query: any = {};
//     // Optional search query
//     if (req.query.searchQuery) {
//       let regex = new RegExp(`${req.query.searchQuery}`, "i");
//       query = { ...query, $or: [{ name: regex }, { companyName: regex }] };
//     }
//     // Optional filters
//     if (req.query.q) {
//       let regex = new RegExp(`${req.query.q}`, "i");
//       query = { ...query, $or: [{ name: regex }, { companyName: regex }] };
//     }
//     if (req.query.role) {
//       query = { ...query, "role": req.query.role };
//     }
//     if (req.query.category) {
//       query = { ...query, "categoryIdArr.categoryId": req.query.category };
//     }
//     if (req.query.rating) {
//       let ratingValue: number = +req.query.rating;
//       query = { ...query, "rating": { $gte: ratingValue } };
//     }
//     if (req.query.locations) {
//       let locationArr = `${req.query.locations}`.split(",");
//       query = { ...query, "cityId": { $in: [...locationArr] } };
//     }
//     if (req.query.state) {
//       let locationArr = `${req.query.state}`.split(",");
//       query = { ...query, "stateId": { $in: [...locationArr] } };
//     }
//     // Pagination
//     let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
//     let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
//     const pipeline: any = [
//       {
//         "$match": {
//           ...query,
//         },
//       },
//       {
//         "$lookup": {
//           "from": "products",
//           "localField": "_id",
//           "foreignField": "createdById",
//           "pipeline": [
//             {
//               "$match": {
//                 "approved": "APPROVED",
//               },
//             },
//           ],
//           "as": "productsArr",
//         },
//       },
//       {
//         "$addFields": {
//           "productsCount": {
//             "$size": "$productsArr",
//           },
//         },
//       },
//       // Removed unwinding stages to keep products array intact
//       {
//         "$skip": (pageValue - 1) * limitValue,
//       },
//       {
//         "$limit": limitValue,
//       },
//     ];
//     // Execute the aggregation pipeline
//     const profiles = await User.aggregate(pipeline);
//     // Step 1: Extract cityIds and stateIds from the profiles
//     const cityIds = profiles
//       .map((profile: any) => profile.cityId)
//       .filter((id: any) => id); // Ensure no null or undefined values
//     const stateIds = profiles
//       .map((profile: any) => profile.stateId)
//       .filter((id: any) => id); // Ensure no null or undefined values
//     // Step 2: Fetch city and state details
//     const cityDetails = await City.find({ _id: { $in: cityIds } }).select("name _id");
//     const stateDetails = await State.find({ _id: { $in: stateIds } }).select("name _id");
//     // Step 3: Merge city and state details into the profiles
//     const finalProfiles = profiles.map((profile: any) => {
//       const city = cityDetails.find((c: any) => c._id.toString() === (profile.cityId || '').toString());
//       const state = stateDetails.find((s: any) => s._id.toString() === (profile.stateId || '').toString());
//       return {
//         ...profile,
//         cityName: city ? city.name : null,
//         stateName: state ? state.name : null,
//       };
//     });
//     // Get total profiles count for pagination
//     const totalPipeline = [
//       { "$match": { ...query } },
//       { "$count": "count" },
//     ];
//     const totalProfiles: any = await User.aggregate(totalPipeline);
//     const total = totalProfiles.length > 0 ? totalProfiles[0].count : 0;
//     const totalPages = Math.ceil(total / limitValue);
//     res.json({ message: "getALLuserforwebsite", data: finalProfiles, total: totalPages });
//   } catch (error) {
//     next(error);
//   }
// }
const getTopVendors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.query, "query");
        let query = {};
        // Optional search query
        if (req.query.searchQuery) {
            let regex = new RegExp(`${req.query.searchQuery}`, "i");
            query = Object.assign(Object.assign({}, query), { $or: [{ name: regex }, { companyName: regex }] });
        }
        // Optional filters
        if (req.query.q) {
            let regex = new RegExp(`${req.query.q}`, "i");
            query = Object.assign(Object.assign({}, query), { $or: [{ name: regex }, { companyName: regex }] });
        }
        if (req.query.role) {
            query = Object.assign(Object.assign({}, query), { "role": req.query.role });
        }
        if (req.query.category) {
            query = Object.assign(Object.assign({}, query), { "categoryIdArr.categoryId": req.query.category });
        }
        if (req.query.rating) {
            let ratingValue = +req.query.rating;
            query = Object.assign(Object.assign({}, query), { "rating": { $gte: ratingValue } });
        }
        if (req.query.locations) {
            let locationArr = `${req.query.locations}`.split(",");
            query = Object.assign(Object.assign({}, query), { "cityId": { $in: [...locationArr] } });
        }
        if (req.query.state) {
            let locationArr = `${req.query.state}`.split(",");
            query = Object.assign(Object.assign({}, query), { "stateId": { $in: [...locationArr] } });
        }
        // Pagination
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        const pipeline = [
            {
                "$match": Object.assign({}, query),
            },
            {
                "$sort": {
                    "rating": -1, // Sort by rating in descending order
                },
            },
            {
                "$lookup": {
                    "from": "products",
                    "localField": "_id",
                    "foreignField": "createdById",
                    "pipeline": [
                        {
                            "$match": {
                                "approved": "APPROVED",
                            },
                        },
                    ],
                    "as": "productsArr",
                },
            },
            {
                "$addFields": {
                    "productsCount": {
                        "$size": "$productsArr",
                    },
                },
            },
            {
                "$unwind": {
                    "path": "$productsArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$unwind": {
                    "path": "$productsArr.categoryArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$group": {
                    "_id": "$_id",
                    "name": { "$first": "$name" },
                    "companyName": { "$first": "$companyObj.name" },
                    "bannerImage": { "$first": "$bannerImage" },
                    "profileImage": { "$first": "$profileImage" },
                    "productsCount": { "$first": "$productsCount" },
                    "rating": { "$first": "$rating" },
                    "categoryIdArr": { "$addToSet": { "categoryId": { "$toString": "$productsArr.categoryArr.categoryId" } } },
                    "countryId": { "$first": "$countryId" },
                    "stateId": { "$first": "$stateId" },
                    "cityId": { "$first": "$cityId" },
                    "phone": { "$first": "$phone" },
                },
            },
            {
                "$sort": {
                    "rating": -1, // Ensure the sorting by rating
                },
            },
            {
                "$skip": (pageValue - 1) * limitValue,
            },
            {
                "$limit": limitValue,
            },
        ];
        // Execute the aggregation pipeline
        const profiles = yield user_model_1.User.aggregate(pipeline);
        // Step 1: Extract cityIds and stateIds from the profiles
        const cityIds = profiles
            .map((profile) => profile.cityId)
            .filter((id) => id); // Ensure no null or undefined values
        const stateIds = profiles
            .map((profile) => profile.stateId)
            .filter((id) => id); // Ensure no null or undefined values
        // Step 2: Fetch city and state details
        const cityDetails = yield City_model_1.City.find({ _id: { $in: cityIds } }).select("name _id");
        const stateDetails = yield State_model_1.State.find({ _id: { $in: stateIds } }).select("name _id");
        // Step 3: Merge city and state details into the profiles
        const finalProfiles = profiles.map((profile) => {
            const city = cityDetails.find((c) => c._id.toString() === (profile.cityId || '').toString());
            const state = stateDetails.find((s) => s._id.toString() === (profile.stateId || '').toString());
            return Object.assign(Object.assign({}, profile), { cityName: city ? city.name : null, stateName: state ? state.name : null });
        });
        // Get total profiles count for pagination
        const totalPipeline = [
            { "$match": Object.assign({}, query) },
            { "$count": "count" },
        ];
        const totalProfiles = yield user_model_1.User.aggregate(totalPipeline);
        const total = totalProfiles.length > 0 ? totalProfiles[0].count : 0;
        const totalPages = Math.ceil(total / limitValue);
        res.json({ message: "Top Profiles", data: finalProfiles, total: totalPages });
    }
    catch (error) {
        next(error);
    }
});
exports.getTopVendors = getTopVendors;
const getAllUsersWithAniversaryDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _y, _z;
    try {
        console.log(req.query, "query");
        let query = {};
        if (req.query.startDate) {
            // let tempstartDate: any = req?.query?.startDate
            // console.log(new Date(tempstartDate))
            query = Object.assign(Object.assign({}, query), { aniversaryDate: { "$gte": new Date(`${req.query.startDate}`) } });
        }
        if (req.query.endDate) {
            query = Object.assign(Object.assign({}, query), { aniversaryDate: { "$lte": new Date(`${req.query.endDate}`) } });
        }
        if (req.query.startDate && req.query.endDate) {
            query = Object.assign(Object.assign({}, query), { aniversaryDate: { "$gte": new Date(`${req.query.startDate}`), "$lte": new Date(`${req.query.endDate}`) } });
        }
        let ogPipeline = [
            {
                "$match": {
                    "role": {
                        "$ne": "ADMIN",
                    },
                },
            },
            {
                "$match": Object.assign({}, query),
            },
            {
                "$count": "total",
            },
        ];
        let pipeline = [
            {
                "$match": {
                    "role": {
                        "$ne": "ADMIN",
                    },
                },
            },
            {
                "$match": Object.assign({}, query),
            },
            {
                "$sort": {
                    "aniversaryDate": -1,
                },
            },
        ];
        if (req.query.q) {
            pipeline.push({
                "$match": { $or: [{ name: new RegExp(`${req.query.q}`, "i") }, { email: new RegExp(`${req.query.q}`, "i") }] },
            });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        if (pageValue) {
            pipeline.push({
                "$skip": (pageValue - 1) * limitValue,
            });
        }
        if (limitValue) {
            pipeline.push({
                "$limit": limitValue,
            });
        }
        let totalCount = yield user_model_1.User.aggregate(ogPipeline).exec();
        console.log(JSON.stringify(ogPipeline, null, 2), "ogPipeline");
        console.log(JSON.stringify(pipeline, null, 2), "pipeline");
        console.log((_y = totalCount[0]) === null || _y === void 0 ? void 0 : _y.total, "totalCount");
        let users = yield user_model_1.User.aggregate(pipeline).exec();
        // console.log(users, "users")
        res.json({ message: "ALL Users with subscription", data: users, totalCounts: (_z = totalCount[0]) === null || _z === void 0 ? void 0 : _z.total });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsersWithAniversaryDate = getAllUsersWithAniversaryDate;
const registerUserFcmToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(req.body, "CHECK HERER");
        const existCheck = yield UserFcmTokens_model_1.UserFcmToken.findOne({ fcmToken: req.body.fcmToken, userId: req.body.userId })
            .lean()
            .exec();
        if (existCheck) {
            throw new Error("Fcm Token Exists");
        }
        yield new UserFcmTokens_model_1.UserFcmToken(req.body).save();
        res.status(200).json({ message: "Token Registered", success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.registerUserFcmToken = registerUserFcmToken;
const getUserNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let ProductArr = [];
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.isRead != undefined && req.query.isRead) {
            query.isRead = req.query.isRead;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        ProductArr = yield Notifications_model_1.Notifications.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .sort({ createdAt: -1 })
            .exec();
        let totalElements = yield Notifications_model_1.Notifications.find(query).count().exec();
        console.log(totalElements, ProductArr === null || ProductArr === void 0 ? void 0 : ProductArr.length);
        res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.getUserNotifications = getUserNotifications;
const markedAsReadNotificatins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        else {
            throw new Error("User not Exist");
        }
        yield Notifications_model_1.Notifications.updateMany({ userId: req.query.userId }, { $set: { isRead: true } });
        res.status(200).json({ message: "mark as Read", success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.markedAsReadNotificatins = markedAsReadNotificatins;
const getSalesUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let arr = yield user_model_1.User.find({ role: constant_1.ROLES.SALES }).exec();
        res.status(200).json({ message: "Arr", data: arr, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.getSalesUsers = getSalesUsers;
const ChangeAllManufacturerRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let arr = yield user_model_1.User.find({ role: "MANUFACTURER" }).exec();
        yield user_model_1.User.updateMany({ _id: { $in: [...arr.map((el) => el._id)] } }, { $set: { role: constant_1.ROLES.MANUFACTURER } }).exec();
        res.status(200).json({ message: "Arr", data: arr, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.ChangeAllManufacturerRoles = ChangeAllManufacturerRoles;
const getAllSalesReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tempStartDate = new Date();
        let tempEndDate = new Date();
        let matchDateObj = {};
        if (req.query.startDate) {
            tempStartDate = new Date(`${req.query.startDate}`);
        }
        else {
            tempStartDate.setMonth(tempStartDate.getMonth() - 1);
        }
        if (req.query.endDate) {
            tempEndDate = new Date(`${req.query.endDate}`);
        }
        tempStartDate.setHours(0, 0, 0, 0);
        tempEndDate.setHours(23, 59, 59, 59);
        let page = 0;
        let limit = 1000;
        if (req.query.perPage) {
            limit = parseInt(`${req.query.perPage}`);
        }
        if (req.query.page) {
            page = parseInt(`${req.query.page}`);
            page -= 1;
        }
        matchDateObj = {
            "$and": [
                {
                    "salesArr.createdAt": {
                        "$lte": new Date(tempEndDate),
                    },
                },
                {
                    "salesArr.createdAt": {
                        "$gte": new Date(tempStartDate),
                    },
                },
            ],
        };
        let nameSearchObj = {};
        if (req.query.q && req.query.q != "") {
            nameSearchObj.name = new RegExp(`${req.query.q}`, "i");
        }
        let pipeline = [
            {
                "$match": {
                    "$and": [
                        {
                            "$or": [
                                {
                                    "role": "SALES",
                                },
                                {
                                    "role": "FIELDUSER",
                                },
                            ],
                        },
                        nameSearchObj,
                    ],
                },
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "_id",
                    "foreignField": "salesId",
                    "as": "salesArr",
                },
            },
            {
                "$unwind": {
                    "path": "$salesArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$match": {
                    "$or": [
                        matchDateObj,
                        {
                            "salesArr": {
                                "$exists": false,
                            },
                        },
                    ],
                },
            },
            {
                "$group": {
                    "_id": "$_id",
                    "name": {
                        "$first": "$name",
                    },
                    "role": {
                        "$first": "$role",
                    },
                    "salesArr": {
                        "$addToSet": "$salesArr",
                    },
                },
            },
            {
                "$addFields": {
                    "salesCount": {
                        "$size": "$salesArr",
                    },
                },
            },
            {
                "$sort": {
                    "name": -1,
                },
            },
            {
                "$skip": page * limit,
            },
            {
                "$limit": limit,
            },
        ];
        let pipeline2 = [
            {
                "$match": {
                    "$or": [
                        {
                            "role": "SALES",
                        },
                        {
                            "role": "FIELDUSER",
                        },
                    ],
                },
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "_id",
                    "foreignField": "salesId",
                    "as": "salesArr",
                },
            },
            {
                "$unwind": {
                    "path": "$salesArr",
                    "preserveNullAndEmptyArrays": true,
                },
            },
            {
                "$match": {
                    "$or": [
                        matchDateObj,
                        {
                            "salesArr": {
                                "$exists": false,
                            },
                        },
                    ],
                },
            },
            {
                "$group": {
                    "_id": "$_id",
                    "name": {
                        "$first": "$name",
                    },
                    "role": {
                        "$first": "$role",
                    },
                    "salesArr": {
                        "$addToSet": "$salesArr",
                    },
                },
            },
            {
                "$addFields": {
                    "salesCount": {
                        "$size": "$salesArr",
                    },
                },
            },
        ];
        console.log(JSON.stringify(pipeline, null, 2), "pipeline");
        let arr = yield user_model_1.User.aggregate(pipeline);
        let totalCounts = yield user_model_1.User.aggregate(pipeline2);
        res.status(200).json({ message: "Arr", data: arr, totalPages: totalCounts === null || totalCounts === void 0 ? void 0 : totalCounts.length, success: true });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSalesReport = getAllSalesReport;
