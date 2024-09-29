import { NextFunction, Request, Response } from "express";
import { Lead } from "../models/leads.model";
import { Product } from "../models/product.model";
import { User } from "../models/user.model";
import { UserSubscription } from "../models/userSubscription.model";
import { UserFcmToken } from "../models/UserFcmTokens.model";
import { notification_text } from "../helpers/constant";
import { Notifications } from "../models/Notifications.model";
import { fcmMulticastNotify } from "../helpers/fcmNotify";
import { Country } from "../models/country.model";
import { State } from "../models/State.model";
import { City } from "../models/City.model";
import { postSpiCrmLead } from "../service/sipCrm.service";
import mongoose from "mongoose";
import { startOfDay, endOfDay } from 'date-fns'; // Use date-fns for date comparison if needed

export const addLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("ADDING LEAD", req.body);
    if (req.body.userId == req.body.createdById) {
      throw new Error("You cannot contact yourself");
    }

    let userObj = await User.findById(req.body.createdById).exec();
    console.log(userObj?.subscriptionEndDate, "userObjuserObjuserObj");
    if (!userObj?.subscriptionEndDate) {
      throw new Error("You do not have a valid subscription to create a lead.");
    }

    if (userObj.isBlocked) {
      throw new Error("Your subscription is blocked please contact admin");
    }
    let subscriptionEndDate = new Date(userObj?.subscriptionEndDate);
    let currentDate = new Date();
    if (subscriptionEndDate.getTime() < currentDate.getTime()) {
      throw new Error("You do not have a valid subscription to create a lead.");
    }
    let productName = "";
    let productObj = await Product.findById(req.body.productId).exec();
    if (productObj && productObj.name) {
      productName = productObj.name;
    }

    const newEntry = new Lead(req.body).save();

    if (!newEntry) {
      throw new Error("Unable to create Lead");
    }
    let crmObj = {
      PersonName: userObj?.name,
      MobileNo: userObj?.phone,
      EmailID: userObj?.email,
      CompanyName: `${userObj?.companyObj?.name}`,
      OfficeAddress: `${userObj?.address}`,
      MediumName: "Contact Supplier",
      Country: "",
      State: "",
      City: "",
      SourceName: "app",
      InitialRemarks: productName,
    };
    if (req.body?.SourceName) {
      crmObj.SourceName = req.body?.SourceName;
    }
    if (userObj.countryId) {
      let countryObj = await Country.findById(userObj.countryId).exec();
      crmObj.Country = countryObj?.name ? countryObj?.name : "";
    }
    if (userObj.stateId) {
      let stateObj = await State.findById(userObj.stateId).exec();
      crmObj.State = stateObj?.name ? stateObj?.name : "";
    }
    if (userObj.cityId) {
      let cityObj = await City.findById(userObj.cityId).exec();
      crmObj.City = cityObj?.name ? cityObj?.name : "";
    }
    await postSpiCrmLead(crmObj);
    let fcmTokensArr = await UserFcmToken.find({ userId: req.body.userId, fcmToken: { $ne: null } }).exec();

    if (fcmTokensArr && fcmTokensArr?.length > 0) {
      let obj = {
        tokens: fcmTokensArr.map((el) => el.fcmToken),
        data: {
          title: notification_text.lead_notification_text_obj.title,
          content: `${notification_text.lead_notification_text_obj.content} ${productName ? "on " + productName : ""}`,
        },
      };

     
      let visitorUserId=req.body.createdById;
      let leadUser = await User.findById(visitorUserId).lean().exec();
      if (!leadUser) throw new Error("Lead User Not Found");

          const newNotification = new Notifications({
              userId: req.body.userId,            // ID of the user related to the notification
              type: 'contact',                 // Type of notification
              title: 'Someone tried to contact you',   // Title of the notification
              content: `Someone tried to contact you  => user ${visitorUserId}`, // Message content
              sourceId: visitorUserId,              // ID of the user who accessed the profile
              isRead: false,                        // Notification status
              viewCount: 1,                         // Initialize viewCount to 1
              lastAccessTime: new Date(),           // Set initial last access time
              payload: {                            // Dynamic payload data
                  accessedBy: visitorUserId,
                  accessTime: new Date(),
                  organizationName: leadUser?.companyObj?.name || 'Unknown' ,
                  phone: leadUser?.phone,
                  productObj:productObj,
                  name:leadUser?.name,
                  leadUserObj:leadUser
              }
          });
  
          // Save the new notification to the database
          try {
              await newNotification.save();
              console.log('New notification created with viewCount and lastAccessTime');
          } catch (error) {
              console.error('Error saving new notification:', error);
          }
      
  
      
      if (obj?.tokens && obj?.tokens?.length > 0) {
        await fcmMulticastNotify(obj);
      }
    }



    res.status(200).json({ message: "Lead Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let LeadArr: any = [];
    let query: any = {};
    console.log(req.query, "req.query.q");
    if (req.query.q) {
      query.name = new RegExp(`${req.query.q}`, "i");
    }
    // if (req.query.LeadId) {
    //   query.LeadId = req.query.LeadId;
    // }
    LeadArr = await Lead.find(query).lean().exec();
    // for (let Lead of LeadArr) {
    //   if (Lead.LeadId) {
    //     console.log(Lead.LeadId, "LeadIdLeadId")
    //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
    //   }
    // }

    res.status(200).json({ message: "getLead", data: LeadArr, success: true });
  } catch (err) {
    next(err);
  }
};
export const getLeadsForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let LeadArr: any = [];
    let query: any = {};
    // if (req.query.q) {
    //   query.name = new RegExp(`${req.query.q}`, "i");
    // }

    let pipeline: any = [
      {
        "$addFields": {
          "userId": {
            "$toObjectId": "$userId",
          },
          "productId": {
            "$toObjectId": "$productId",
          },
          "createdById": {
            "$toObjectId": "$createdById",
          },
        },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "userId",
          "foreignField": "_id",
          "as": "userObj",
        },
      },
      {
        "$lookup": {
          "from": "products",
          "localField": "productId",
          "foreignField": "_id",
          "as": "productObj",
        },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "createdById",
          "foreignField": "_id",
          "as": "createdByObj",
        },
      },
      {
        "$unwind": {
          "path": "$userObj",
          "preserveNullAndEmptyArrays": false,
        },
      },
      {
        "$unwind": {
          "path": "$productObj",
          "preserveNullAndEmptyArrays": true,
        },
      },
      {
        "$unwind": {
          "path": "$createdByObj",
          "preserveNullAndEmptyArrays": false,
        },
      },
    ];

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    if (req.query.q) {
      query["$or"] = [
        {
          "userObj.name": new RegExp(`${req.query.q}`, "i"),
        },
        {
          "productObj.name": new RegExp(`${req.query.q}`, "i"),
        },
        {
          "createdByObj.name": new RegExp(`${req.query.q}`, "i"),
        },
      ];
     
    }

       if (req.query.endDate) {
         query = { ...query, createdAt: { $lte: req.query.endDate, $gte: req.query.startDate } };
       }

       if (req.query.startDate) {
         query = { ...query, createdAt: { $gte: req.query.startDate } };
       }

    if (query) {
    pipeline.push({
      "$match": query
    });
  }
    pipeline.push({
      "$skip": (pageValue - 1) * limitValue,
    });

    pipeline.push({
      "$limit": limitValue,
    });

    // if (req.query.LeadId) {
    //   query.LeadId = req.query.LeadId;
    // }
    let totalPages: any = await Lead.find(query).countDocuments();
    LeadArr = await Lead.aggregate(pipeline).exec();

    console.log(LeadArr, "leadArr");
    // for (let Lead of LeadArr) {
    //   if (Lead.LeadId) {
    //     console.log(Lead.LeadId, "LeadIdLeadId")
    //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
    //   }
    // }

    res.status(200).json({ message: "getLead", data: LeadArr, totalPages, success: true });
  } catch (err) {
    next(err);
  }
};
export const getLeadForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let pipeline: any = [
      {
        "$addFields": {
          "userID": {
            "$toObjectId": "$userId",
          },
          "productID": {
            "$toObjectId": "$productId",
          },
        },
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "userID",
          "foreignField": "_id",
          "as": "userObj",
        },
      },
      {
        "$lookup": {
          "from": "products",
          "localField": "productID",
          "foreignField": "_id",
          "as": "productObj",
        },
      },
      {
        "$unwind": {
          "path": "$userObj",
          "preserveNullAndEmptyArrays": false,
        },
      },
      {
        "$unwind": {
          "path": "$productObj",
          "preserveNullAndEmptyArrays": false,
        },
      },
    ];

    let LeadArr: any = [];
    let query: any = {};
    console.log(req.query, "req.query.q");
    if (req.query.q) {
      query.name = new RegExp(`${req.query.q}`, "i");
    }
    // if (req.query.LeadId) {
    //   query.LeadId = req.query.LeadId;
    // }
    LeadArr = await Lead.find(query).lean().exec();
    // for (let Lead of LeadArr) {
    //   if (Lead.LeadId) {
    //     console.log(Lead.LeadId, "LeadIdLeadId")
    //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
    //   }
    // }

    res.status(200).json({ message: "getLead", data: LeadArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getLeadsBycreatedById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let LeadArr: any = [];

    let latestSubscription = await UserSubscription.findOne({ userId: req.params?.id }).exec();

    LeadArr = await Lead.find({ createdById: req.params?.id }).sort({ createdAt: -1 }).lean().exec();

    for (const el of LeadArr) {
      let productObj = await Product.findById(el.productId).exec();
      if (productObj) {
        el.productObj = productObj;
      }

      let userObj = await User.findById(el.userId).exec();
      if (userObj) {
        el.userObj = userObj;
      }
    }

    if (!LeadArr) throw { status: 400, message: "Lead Not Found" };

    // for (let Lead of LeadArr) {
    //   if (Lead.LeadId) {
    //     console.log(Lead.LeadId, "LeadIdLeadId")
    //     Lead.LeadObj = await Lead.findById(Lead.LeadId).exec();
    //   }
    // }
    console.log(LeadArr, LeadArr.length, "sad");
    res.status(200).json({ message: "getLead", data: LeadArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const LeadObj = await Lead.findById(req.params.id).lean().exec();
    if (!LeadObj) {
      throw new Error("Lead not found");
    }

    await Lead.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "Lead Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const LeadObj = await Lead.findByIdAndDelete(req.params.id).exec();
    if (!LeadObj) throw { status: 400, message: "Lead Not Found" };
    res.status(200).json({ message: "Lead Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let LeadsArr: any = await Lead.find({ userId: req.params.id }).lean().exec();
    for (const el of LeadsArr) {
      let productObj = await Product.findById(el.productId).exec();
      if (productObj) {
        el.productObj = productObj;
      }

      let userObj = await User.findById(el.createdById).exec();
      if (userObj) {
        el.userObj = userObj;
      }
    }

    if (!LeadsArr) throw { status: 400, message: "Lead Not Found" };
    res.status(200).json({ message: "Lead Found", data: LeadsArr, success: true });
  } catch (err) {
    next(err);
  }
};
