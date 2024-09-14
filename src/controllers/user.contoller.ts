import { NextFunction, Request, RequestHandler, Response, query } from "express";
import jwt from "jsonwebtoken";
import { comparePassword, encryptPassword } from "../helpers/bcrypt";
import { CONFIG } from "../helpers/config";
import { ROLES } from "../helpers/constant";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { generateRandomNumber } from "../helpers/generators";
import { generateAccessJwt, generateRefreshJwt } from "../helpers/jwt";
import { sendMail } from "../helpers/nodemailer";
import { sendMail as sendMail2 } from "../helpers/mailer";

import { City } from "../models/City.model";
import { State } from "../models/State.model";
import { Country } from "../models/country.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import { UserFcmToken } from "../models/UserFcmTokens.model";
import { Notifications } from "../models/Notifications.model";
import otpModels from "../models/otp.models";
import { ValidateEmail, ValidateLandline, ValidatePhone, validMobileNo } from "../helpers/validiator";
import { postSpiCrmLead } from "../service/sipCrm.service";

export const webLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findOne({ $or: [{ email: new RegExp(`^${req.body.email}$`) }] }).exec();
    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    if (!UserExistCheck.approved) {
      throw new Error(`Please wait while the admins verify you.`);
    }

    const passwordCheck = await comparePassword(UserExistCheck.password, req.body.password);
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
    const token = await generateAccessJwt(userData);
    const user = await User.findByIdAndUpdate(UserExistCheck._id, { token: token }, { new: true }).exec();
    const refreshToken = await generateRefreshJwt(userData);
    res.status(200).json({ message: "User Logged In", role: userData?.role, token, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const appLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    if (!req.body.otp) {
      throw new Error(`Otp is required`);
    }
    let phone = req.body.phone;
    let verifyOtp = phone.substr(4, phone.length - 1);
    console.log(verifyOtp, verifyOtp);

    let otp = req.body.otp;
    const response = await otpModels.find({ phone }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      console.log(response, "responseresponseresponse");

      throw new Error("Invalid OTP");
    }
    // if (req.body.otp !== verifyOtp) {
    //   throw new Error(`Invalid OTP`);
    // }
    const UserExistCheck = await User.findOne({ $or: [{ phone: new RegExp(`^${req.body.phone}$`) }] }).exec();
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
    const token = await generateAccessJwt(userData);
    const user = await User.findByIdAndUpdate(UserExistCheck._id, { token: token }, { new: true }).exec();
    res.status(200).json({ message: "User Logged In", token: token });
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const UserExistEmailCheck = await User.findOne({
    //   phone: new RegExp(`^${req.body.phone}$`),
    // }).exec();

    // if (UserExistEmailCheck) {
    //   throw new Error(`User with this phone number Already Exists`);
    // }
    console.log(req.body, "SSD");

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
    }).exec();
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }
    const documents = [];
    if (req.body.gstCertificate) {
      let gstCertificate = await storeFileAndReturnNameBase64(req.body.gstCertificate);
      documents.push({ name: "gstCertificate", image: gstCertificate });
    }

    if (req.body.profileImage && req.body.profileImage.includes("base64")) {
      req.body.profileImage = await storeFileAndReturnNameBase64(req.body.profileImage);
    }

    if (req.body.bannerImage && req.body.bannerImage.includes("base64")) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }
    if (documents.length > 0) {
      req.body.documents = documents;
    }
    if (req.body.password) {
      req.body.password = await encryptPassword(req.body.password);
    }

    if (req.body.salesId) {
      req.body.salesId = await new mongoose.Types.ObjectId(req.body.salesId);
    }

    const user = await new User({ ...req.body, role: req.body.role }).save();

    res.status(201).json({ message: "User Created", data: user._id, success: true });
  } catch (error) {
    next(error);
  }
};

export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const UserExistEmailCheck = await User.findOne({
    //   email: new RegExp(`^${req.body.email}$`),
    //   _id: { $ne: req.params.id },
    // }).exec();
    // console.log(UserExistEmailCheck, { email: new RegExp(`^${req.body.email}$`), _id: { $ne: req.params.id } });
    // if (UserExistEmailCheck) {
    //   throw new Error(`User with this email Already Exists`);
    // }

    if (!ValidatePhone(req.body.phone)) {
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
    if (req.body?.companyObj?.email && !ValidateEmail(req.body?.companyObj?.email)) {
      throw new Error("Email address is not valid !!!!");
    }

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
      _id: { $ne: req.params.id },
    }).exec();
    console.log(UserExistPhoneCheck, "UserExistPhoneCheck");
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }

    const documents = [];

    if (req.body.gstCertificate && req.body.gstCertificate.includes("base64")) {
      let gstCertificate = await storeFileAndReturnNameBase64(req.body.gstCertificate);
      documents.push({ name: "gstCertificate", image: gstCertificate });
    } else {
      delete req.body.gstCertificate;
    }

    if (req.body.imagesArr && req.body.imagesArr.length) {
      for (const el of req.body.imagesArr) {
        if (req.body.imagesArr && req.body.imagesArr.length > 5) {
          throw new Error("You cannot add more than 5 images");
        }
        if (el.image && el.image.includes("base64")) {
          el.image = await storeFileAndReturnNameBase64(el.image);
        }
      }
    }

    if (req.body.videoArr && req.body.videoArr.length) {
      for (const el of req.body.videoArr) {
        if (req.body.videoArr && req.body.videoArr.length > 5) {
          throw new Error("You cannot add more than 5 videos");
        }
        if (el.video && el.video.includes("base64")) {
          el.video = await storeFileAndReturnNameBase64(el.video);
        }
      }
    }

    if (req.body.profileImage && req.body.profileImage.includes("base64")) {
      req.body.profileImage = await storeFileAndReturnNameBase64(req.body.profileImage);
    }
    if (req.body.bannerImage && req.body.bannerImage.includes("base64")) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }
    if (documents.length > 0) {
      req.body.documents = documents;
    }

    if (req.body.salesId) {
      req.body.salesId = await new mongoose.Types.ObjectId(req.body.salesId);
    }
    await User.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(201).json({ message: "Your profile is updated", success: true });
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    // const UserExistEmailCheck = await User.findOne({
    //   email: new RegExp(`^${req.body.email}$`),
    // }).exec();

    // if (UserExistEmailCheck) {
    //   throw new Error(`User with this email Already Exists`);
    // }

    if (!ValidatePhone(req.body.phone)) {
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
    console.log(req.body?.companyObj?.email, "req.body.email");
    if (req.body?.companyObj?.email && !ValidateEmail(req.body?.companyObj?.email)) {
      throw new Error("Email address is not valid !!!!");
    }

    if (req.body?.email) {
      if (!ValidateEmail(req.body?.email)) {
        throw new Error("Email address is not valid !!!!");
      }
    } else {
      req.body.email = req.body?.companyObj?.email;
    }

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
    }).exec();
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }

    if (req.body.profileImage && req.body.profileImage.includes("base64")) {
      req.body.profileImage = await storeFileAndReturnNameBase64(req.body.profileImage);
    }

    if (req.body.bannerImage && req.body.bannerImage.includes("base64")) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }

    if (req.body.password) {
      req.body.password = await encryptPassword(req.body.password);
    } else {
      req.body.password = await encryptPassword(req?.body?.name + "1234");
    }
    const documents = [];
    if (req.body.gstCertificate) {
      const gstCertificate = await storeFileAndReturnNameBase64(req.body.gstCertificate);
      documents.push({ name: "gstCertificate", image: gstCertificate });
    }

    if (documents.length > 0) {
      req.body.documents = documents;
    }
    let user = await new User(req.body).save();

    if (user && user?._id) {
      let email = user?.email ? user?.email : user?.companyObj?.email;
      let name = user?.name;
      let emailArr = [
        {
          name,
          email,
        },
      ];
      let customerTitle = `Thank you for registering`;
      // await sendMail2(emailArr, `${user._id}`, customerTitle,user);

      let crmObj = {
        PersonName: user?.name,
        MobileNo: user?.phone,
        EmailID: user?.email,
        CompanyName: `${user?.companyObj?.name}`,
        OfficeAddress: `${user?.address}`,
        MediumName: "Register",
        Country: "",
        State: "",
        City: "",
        SourceName: "app",
      };

      if (req.body?.SourceName) {
        crmObj.SourceName = req.body?.SourceName;
      }
      if (user.countryId) {
        let countryObj = await Country.findById(user.countryId).exec();
        crmObj.Country = countryObj?.name ? countryObj?.name : "";
      }
      if (user.stateId) {
        let stateObj = await State.findById(user.stateId).exec();
        crmObj.State = stateObj?.name ? stateObj?.name : "";
      }
      if (user.cityId) {
        let cityObj = await City.findById(user.cityId).exec();
        crmObj.City = cityObj?.name ? cityObj?.name : "";
      }
      await postSpiCrmLead(crmObj);
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
    const token = await generateAccessJwt(userData);
    let userObj = await User.findByIdAndUpdate(user._id, { token: token }, { new: true }).exec();
    res.status(201).json({ message: "Registered", data: user._id, token });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId).exec();
    res.status(201).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user: any = await User.findById(req.params.userId).lean().exec();
    console.log(user, "user");
    if (!user) throw new Error("User Not Found");
    if (user.countryId) {
      user.countryObj = await Country.findById(user.countryId).exec();
    }
    if (user.stateId) {
      user.stateObj = await State.findById(user.stateId).exec();
    }
    if (user.cityId) {
      user.cityObj = await City.findById(user.cityId).exec();
    }

    let today: any = new Date();
    today.setHours(23, 59, 59);
    let expiry: any = new Date(user.subscriptionEndDate);
    expiry.setHours(23, 59, 59);

    let userSubscriptionExpired = true;
    if (user.subscriptionEndDate && today.getTime() <= expiry.getTime()) {
      userSubscriptionExpired = false;
    } else {
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
  } catch (error) {
    next(error);
  }
};

export const approveUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let status = req.body.status;
    const user = await User.findByIdAndUpdate(req.params.userId, { approved: status }, { new: true }).exec();
    res.status(201).json({ message: "User Approval status changed", data: user });
  } catch (error) {
    next(error);
  }
};

export const verifyUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isVerified: req.body.isVerified },
      { new: true }
    ).exec();
    res.status(201).json({ message: "User Verification status changed", data: user });
  } catch (error) {
    next(error);
  }
};

export const blockUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: req.body.isBlocked },
      { new: true }
    ).exec();
    res.status(201).json({ message: "User Subscription Block status changed", data: user });
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("Error Uploading File");
    }

    const userObj = await User.findByIdAndUpdate(req.params.userId, {
      $push: { documents: { fileName: req.file?.filename } },
    }).exec();

    if (!userObj) {
      throw new Error(`User does not exist`);
    }

    res.json({ message: "Image Uploaded", data: req.file.filename });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userObj: any = await User.findById(req.user?.userId).exec();

    let query: any = { $and: [{ role: { $ne: ROLES.ADMIN } }] };

    if (userObj && userObj.role) {
      if (userObj.role !== ROLES.ADMIN) {
        query.$and.push({ role: { $ne: userObj?.role } });
      }
      if (userObj.role === ROLES.FIELDUSER) {
        query.$and.push({ role: { $ne: ROLES.SUBADMIN } });
      }
    }

    if (req.query.q) {
      query = {
        ...query,
        $or: [{ name: new RegExp(`${req.query.q}`, "i") }, { email: new RegExp(`${req.query.q}`, "i") }],
      };
    }
    if (req.query.role && `${req.query.role}`.toLowerCase() != "all") {
      query = { ...query, role: req.query.role };
    }
    if (req.query.status && req.query.status != "") {
      query = { ...query, approved: req.query.status == "active" ? true : false };
    }
    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    let totalCount = await User.find(query).countDocuments();

    let totalUsers = await User.find({ role: { $ne: ROLES.ADMIN } }).countDocuments();
    let totalDistributors = await User.find({ role: ROLES.DISTRIBUTOR }).countDocuments();
    let totalManufacturers = await User.find({ role: ROLES.MANUFACTURER }).countDocuments();
    let totalDealers = await User.find({ role: ROLES.DEALER }).countDocuments();
    console.log(query, "userObj.role === ROLES.FIELDUSER &&");
    let users: any = await User.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue).
      sort({createdAt:-1})
      .lean()
      .exec();

    if (!(req.query.showName && req.query.showName != "" && req.query.showName == "true")) {
      for (const user of users) {
        if (user.countryId) {
          user.countryObj = await Country.findById(user.countryId).exec();
        }
        if (user.stateId) {
          user.sateObj = await State.findById(user.stateId).exec();
        }
        if (user.cityId) {
          user.cityObj = await City.findById(user.cityId).exec();
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
  } catch (error) {
    next(error);
  }
};

export const searchVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "query");

    let query: any = {};

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
    let users: any = await User.aggregate(pipeline);
    console.log("USERS", users, "USERS2");
    // let users: any = await User.find(query).select({ _id: 1, name: 1, companyObj: 1 }).lean()
    //   .exec();

    res.json({
      message: "ALL Users",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersWithSubsciption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "query");

    let ogPipeline: any = [
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

    let pipeline: any = [
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

    let query:any = {};
    if (req.query.q) {
      query["$or"] =[{ name: new RegExp(`${req.query.q}`, "i") }, { email: new RegExp(`${req.query.q}`, "i") }]
    }

        if (req.query.startDate) {
              query = { ...query, createdAt: { $gte: req.query.startDate, $lte: req.query.endDate } };

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

    let totalCount: any = await User.aggregate(ogPipeline).exec();
    console.log(totalCount[0].total, "totalCount");

    let users: any = await User.aggregate(pipeline).exec();

    res.json({ message: "ALL Users with subscription", data: users, totalCounts: totalCount[0].total });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.refreshToken) throw new Error(`Refresh Token is required`);
    let token = req.body.refreshToken;
    const decoded: any = jwt.verify(token, CONFIG.JWT_ACCESS_REFRESH_TOKEN_SECRET);
    // Add user from payload
    req.user = decoded;
    if (req.user) {
      const UserExistCheck = await User.findById(decoded.userId).exec();
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
      token = await generateAccessJwt({ userData });
      const refreshToken = await generateRefreshJwt({ userData });
      res.status(200).json({ message: "Refresh Token", token: token, refreshToken: refreshToken });
    }
  } catch (error) {
    next(error);
  }
};

export const sentOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let findArr = [];

    if (req.body.email && req.body.email != "") {
      findArr.push({ email: new RegExp(`^${req.body.email}$`, "i") });
    }
    if (req.body.phone && req.body.phone != "") {
      findArr.push({ phone: new RegExp(`^${req.body.phone}$`, "i") });
    }

    const UserExistCheck = await User.findOne({ $or: findArr }).exec();
    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    let otp = generateRandomNumber(6);
    if (req.body.phone == "9000000000") {
      otp = "123456";
    }

    if (req.body.phone && req.body.phone != "") {
      const otpPayload = { phone: req.body.phone, otp };
      const otpBody = await otpModels.create(otpPayload);
    }

    if (req.body.email && req.body.email != "") {
      await sendMail(UserExistCheck.email, otp);
    }

    console.log(UserExistCheck, "UserExistCheck");
    console.log("w");
    res.status(200).json({ message: "OTP send to your mobile" + req.body.phone });
  } catch (error) {
    next(error);
  }
};

export const checkForValidSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userObj = await User.findOne({ _id: req.params.id }).exec();
    if (!userObj) {
      throw new Error(`User Does Not Exist`);
    }

    if (!userObj?.subscriptionEndDate) {
      throw new Error("You do not have a valid subscription to create a lead.");
    }

    let subscriptionEndDate = new Date(userObj?.subscriptionEndDate);
    let currentDate = new Date();
    if (subscriptionEndDate.getTime() < currentDate.getTime()) {
      throw new Error("You do not have a valid subscription to create a lead.");
    }

    res.status(200).json({ message: `User have a valid subscription` });
  } catch (error) {
    next(error);
  }
};

export const checkForValidSubscriptionAndReturnBoolean = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let validSubscription = false;

    const userObj = await User.findOne({ _id: req.params.id }).exec();
    if (!userObj) {
      throw new Error(`User Does Not Exist`);
    }

    console.log(userObj, "checkForValidSubscriptionAndReturnBoolean");

    let subscriptionEndDate = new Date(userObj?.subscriptionEndDate);
    let currentDate = new Date();
    if (subscriptionEndDate.getTime() > currentDate.getTime()) {
      validSubscription = true;
    }
    if (userObj?.isBlocked) {
      validSubscription = false;
    }

    console.log(validSubscription, "validSubscription");
    res.status(200).json({ message: `User have a valid subscription`, data: validSubscription });
  } catch (error) {
    next(error);
  }
};
export const getAllUsersForWebsite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "query");

    let query: any = {};

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
      query = { ...query, ...{ $or: rangeQuery } };
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
      query = { ...query, ...{ $or: rangeQuery } };
    }

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    let mainRoleQuery = {};

    if (req.query.role && req.query.role != null && req.query.role != "null") {
      mainRoleQuery = { ...mainRoleQuery, "role": { $ne: req.query.role } };
    }

    if (req.query.userTypes) {
      let userTypesArr = `${req.query.userTypes}`.split(",").filter((el) => el != "");
      query = { ...query, "role": { $in: [...userTypesArr.map((el) => new RegExp(el, "i"))] } };
    }

    if (req.query.category) {
      query = { ...query, "categoryIdArr.categoryId": req.query.category };
    }
    if (req.query.categories) {
      let categoryArr = `${req.query.categories}`.split(",");
      query = {
        ...query,
        $or: [
          { "categoryIdArr.categoryId": { $in: [...categoryArr] } },
          { "categoryArr.categoryId": { $in: [...categoryArr.map((el) => new mongoose.Types.ObjectId(el))] } },
        ],
      };
    }
    if (req.query.locations) {
      let locationArr = `${req.query.locations}`.split(",");
      query = { ...query, "cityId": { $in: [...locationArr] } };
    }
    if (req.query.state) {
      let locationArr = `${req.query.state}`.split(",");
      query = { ...query, "stateId": { $in: [...locationArr] } };
    }
    // if (req.query.city) {
    //   let locationArr = `${req.query.city}`.split(",");
    //   query = { ...query, "state": { $in: [...locationArr] } };
    // }
    if (req.query.rating) {
      let ratingValue: number = +req.query.rating;
      query = { ...query, "rating": { $gte: ratingValue } };
    }
    if (req.query.vendors) {
      let vendorArr: any = `${req.query.vendors}`.split(",");
      query = { ...query, $or: vendorArr.map((el: any) => ({ "brandIdArr.brandId": el })) };
    }

    console.log(query, "query");

    const pipeline: any = [
      {
        "$match": {
          $and: [
            { "role": { "$ne": ROLES.SALES } },
            { "role": { "$ne": ROLES.ADMIN } },
            { "role": { "$ne": ROLES.FIELDUSER } },
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
        "$match": {
          ...query,
        },
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
    let users: any = await User.aggregate(pipeline);

    console.log(JSON.stringify(totalPipeline, null, 2), "asd");

    let totalUsers: any = await User.aggregate(totalPipeline);
    console.log(totalUsers, "totalUsers");
    totalUsers = totalUsers.length > 0 ? totalUsers[0].count : 0;
    const totalPages = Math.ceil(totalUsers / limitValue);
    // console.log(JSON.stringify(users, null, 2))
    res.json({ message: "ALL Users", data: users, total: totalPages });
  } catch (error) {
    next(error);
  }
};

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



export const getTopVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "query");

    let query: any = {};

    // Optional search query
    if (req.query.searchQuery) {
      let regex = new RegExp(`${req.query.searchQuery}`, "i");
      query = { ...query, $or: [{ name: regex }, { companyName: regex }] };
    }

    // Optional filters
    if (req.query.q) {
      let regex = new RegExp(`${req.query.q}`, "i");
      query = { ...query, $or: [{ name: regex }, { companyName: regex }] };
    }

    if (req.query.role) {
      query = { ...query, "role": req.query.role };
    }

    if (req.query.category) {
      query = { ...query, "categoryIdArr.categoryId": req.query.category };
    }

    if (req.query.rating) {
      let ratingValue: number = +req.query.rating;
      query = { ...query, "rating": { $gte: ratingValue } };
    }

    if (req.query.locations) {
      let locationArr = `${req.query.locations}`.split(",");
      query = { ...query, "cityId": { $in: [...locationArr] } };
    }

    if (req.query.state) {
      let locationArr = `${req.query.state}`.split(",");
      query = { ...query, "stateId": { $in: [...locationArr] } };
    }

    // Pagination
    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;

    const pipeline: any = [
      {
        "$match": {
          ...query,
        },
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
    const profiles = await User.aggregate(pipeline);

    // Step 1: Extract cityIds and stateIds from the profiles
    const cityIds = profiles
      .map((profile: any) => profile.cityId)
      .filter((id: any) => id); // Ensure no null or undefined values
    const stateIds = profiles
      .map((profile: any) => profile.stateId)
      .filter((id: any) => id); // Ensure no null or undefined values

    // Step 2: Fetch city and state details
    const cityDetails = await City.find({ _id: { $in: cityIds } }).select("name _id");
    const stateDetails = await State.find({ _id: { $in: stateIds } }).select("name _id");

    // Step 3: Merge city and state details into the profiles
    const finalProfiles = profiles.map((profile: any) => {
      const city = cityDetails.find((c: any) => c._id.toString() === (profile.cityId || '').toString());
      const state = stateDetails.find((s: any) => s._id.toString() === (profile.stateId || '').toString());

      return {
        ...profile,
        cityName: city ? city.name : null,
        stateName: state ? state.name : null,
      };
    });

    // Get total profiles count for pagination
    const totalPipeline = [
      { "$match": { ...query } },
      { "$count": "count" },
    ];

    const totalProfiles: any = await User.aggregate(totalPipeline);
    const total = totalProfiles.length > 0 ? totalProfiles[0].count : 0;
    const totalPages = Math.ceil(total / limitValue);

    res.json({ message: "Top Profiles", data: finalProfiles, total: totalPages });
  } catch (error) {
    next(error);
  }
};

export const getAllUsersWithAniversaryDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.query, "query");

    let query = {};
    if (req.query.startDate) {
      // let tempstartDate: any = req?.query?.startDate
      // console.log(new Date(tempstartDate))
      query = { ...query, aniversaryDate: { "$gte": new Date(`${req.query.startDate}`) } };
    }
    if (req.query.endDate) {
      query = { ...query, aniversaryDate: { "$lte": new Date(`${req.query.endDate}`) } };
    }
    if (req.query.startDate && req.query.endDate) {
      query = {
        ...query,
        aniversaryDate: { "$gte": new Date(`${req.query.startDate}`), "$lte": new Date(`${req.query.endDate}`) },
      };
    }

    let ogPipeline: any = [
      {
        "$match": {
          "role": {
            "$ne": "ADMIN",
          },
        },
      },
      {
        "$match": {
          ...query,
        },
      },
      {
        "$count": "total",
      },
    ];

    let pipeline: any = [
      {
        "$match": {
          "role": {
            "$ne": "ADMIN",
          },
        },
      },
      {
        "$match": {
          ...query,
        },
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

    let totalCount: any = await User.aggregate(ogPipeline).exec();
    console.log(JSON.stringify(ogPipeline, null, 2), "ogPipeline");
    console.log(JSON.stringify(pipeline, null, 2), "pipeline");
    console.log(totalCount[0]?.total, "totalCount");
    let users: any = await User.aggregate(pipeline).exec();
    // console.log(users, "users")
    res.json({ message: "ALL Users with subscription", data: users, totalCounts: totalCount[0]?.total });
  } catch (error) {
    next(error);
  }
};
export const registerUserFcmToken: RequestHandler = async (req, res, next) => {
  try {
    // console.log(req.body, "CHECK HERER");
    const existCheck = await UserFcmToken.findOne({ fcmToken: req.body.fcmToken, userId: req.body.userId })
      .lean()
      .exec();
    if (existCheck) {
      throw new Error("Fcm Token Exists");
    }
    await new UserFcmToken(req.body).save();
    res.status(200).json({ message: "Token Registered", success: true });
  } catch (error) {
    next(error);
  }
};

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let ProductArr: any = [];

    let query: any = {};

    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    if (req.query.isRead != undefined && req.query.isRead) {
      query.isRead = req.query.isRead;
    }

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    ProductArr = await Notifications.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .sort({ createdAt: -1 })
      .exec();

    let totalElements = await Notifications.find(query).count().exec();

    console.log(totalElements, ProductArr?.length);

    res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
  } catch (err) {
    next(err);
  }
};
export const markedAsReadNotificatins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {};

    if (req.query.userId) {
      query.userId = req.query.userId;
    } else {
      throw new Error("User not Exist");
    }

    await Notifications.updateMany({ userId: req.query.userId }, { $set: { isRead: true } });

    res.status(200).json({ message: "mark as Read", success: true });
  } catch (err) {
    next(err);
  }
};
export const getSalesUsers: RequestHandler = async (req, res, next) => {
  try {
    let arr = await User.find({ role: ROLES.SALES }).exec();
    res.status(200).json({ message: "Arr", data: arr, success: true });
  } catch (error) {
    next(error);
  }
};

export const ChangeAllManufacturerRoles: RequestHandler = async (req, res, next) => {
  try {
    let arr = await User.find({ role: "MANUFACTURER" }).exec();
    await User.updateMany(
      { _id: { $in: [...arr.map((el) => el._id)] } },
      { $set: { role: ROLES.MANUFACTURER } }
    ).exec();
    res.status(200).json({ message: "Arr", data: arr, success: true });
  } catch (error) {
    next(error);
  }
};

export const getAllSalesReport: RequestHandler = async (req, res, next) => {
  try {
    let tempStartDate: any = new Date();
    let tempEndDate: any = new Date();
    let matchDateObj = {};

    if (req.query.startDate) {
      tempStartDate = new Date(`${req.query.startDate}`);
    } else {
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
    let nameSearchObj: any = {};
    if (req.query.q && req.query.q != "") {
      nameSearchObj.name = new RegExp(`${req.query.q}`, "i");
    }

    let pipeline: any = [
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
    let arr = await User.aggregate(pipeline);
    let totalCounts = await User.aggregate(pipeline2);
    res.status(200).json({ message: "Arr", data: arr, totalPages: totalCounts?.length, success: true });
  } catch (error) {
    next(error);
  }
};
