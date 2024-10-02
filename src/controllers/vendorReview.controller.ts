import { NextFunction, Request, Response } from "express";
import { Country } from "../models/country.model";
import { VendorReview } from "../models/VendorReview.model";
import { Product } from "../models/product.model";
import { User } from "../models/user.model";
import { UserFcmToken } from "../models/UserFcmTokens.model";
import { Notifications } from "../models/Notifications.model";
import { fcmMulticastNotify } from "../helpers/fcmNotify";
import { notification_text } from "../helpers/constant";

export const addVendorReview = async (req: Request, res: Response, next: NextFunction) => {
  try {

      console.log(req.body);
   
      console.log(req.body)
      const newEntry = new VendorReview(req.body).save();

      if (!newEntry) {
          throw new Error("Unable to create VendorReview");
      }


      // let userObj = await User.findById(req.body?.userId).exec();
      let reviewArr = await VendorReview.find({ userId: req.body?.userId }).exec();

      let total = reviewArr && reviewArr.length > 0 ? reviewArr.length : 0;
      let totalRatings = reviewArr && reviewArr.length > 0 ? reviewArr.reduce((acc, el) => acc + el.rating, 0) : 0
      console.log(totalRatings, total, "totalRatings")
      let rating: number = 0;

      if (totalRatings != 0 && total != 0) {
          rating = Math.round(totalRatings / total);
      }

      // Math.round((typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0);
      // console.log(rating, (typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0, '(typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0');
      await User.findByIdAndUpdate(req.body?.userId, { rating: rating }).exec();

      let fcmTokensArr = await UserFcmToken.find({ userId: req.body.userId }).exec();
      console.log(fcmTokensArr)
      let obj = {
          tokens: fcmTokensArr.map((el:any) => el.fcmToken),
          data: { title: notification_text.review_text_obj.title, content: notification_text.review_text_obj.content }
      }
      // let saveNotificationObj = {
      //     userId: req.body.userId,
      //     title: obj.data.title,
      //     content: obj.data.content
      // }
      // await new Notifications(saveNotificationObj).save()

      // console.log(saveNotificationObj, "NOTIFICATION OBJ")

      await fcmMulticastNotify(obj)



      res.status(200).json({ message: "Review Successfully Created", success: true });


    //   const newNotification = new Notifications({
    //     userId: user._id,         
    //     type: 'profile_completion',
    //     title: 'Profile Completed',  
    //     content: `Thanks for joining us! To get started and make the most of our features, please complete your profile setup.`,
    //     sourceId:'',             
    //     isRead: false,                      
    //     viewCount: 1,
    //     lastAccessTime: new Date(),           // Set initial last access time
    //     payload: {                            // Dynamic payload data
    //        userId:user._id
    //     }
    // });
    // // Save the new notification to the database
    // try {
    //     await newNotification.save();
    // } catch (error) {
    //     console.error('Error saving new notification:', error);
    // }


      
  } catch (err) {
      next(err);
  }
};
export const getVendorReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {};

    // Build the query based on the request query parameters
    if (req.query.userId) {
      query = { ...query, userId: req.query.userId };
    }
    if (req.query.startDate && req.query.endDate) {
      query = {
        ...query,
        createdAt: {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string),
        },
      };
    }
    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
    }

    // Get total count of matching product reviews
    const categoryCount = await VendorReview.find(query).countDocuments();

    // Pagination settings
    const pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    // Fetch the reviews (without population for now)
    const vendorReviews = await VendorReview.find(query)
      .skip((pageValue - 1) * limitValue)
      .sort({ createdAt: -1 })
      .limit(limitValue)
      .lean()
      .exec();

    // Extract all unique userIds from vendorReviews
    const userIds = vendorReviews.map(review => review.userId).filter(Boolean);

    // Fetch all relevant users
    const users = await User.find({ _id: { $in: userIds } }).select("profileImage name").lean();

    // Create a Map to link userId with profile details (name and profileImage)
    const userMap = new Map(users.map(user => [user._id.toString(), { name: user.name, profileImage: user.profileImage }]));

    // Attach user details (profileImage and name) to each review
    const enrichedReviews = vendorReviews.map(review => ({
      ...review,
      userName: userMap.get(review.userId.toString())?.name || "Unknown User",
      userProfileImage: userMap.get(review.userId.toString())?.profileImage || "No Image",
    }));

    // Respond with the enriched vendor reviews
    res.status(200).json({
      message: "getVendorReview",
      data: enrichedReviews,
      count: categoryCount,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};





export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const VendorReviewObj = await VendorReview.findById(req.params.id).lean().exec();
        if (!VendorReviewObj) {
            throw new Error("Review not found");
        }


        await VendorReview.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Review Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const VendorReviewObj = await VendorReview.findByIdAndDelete(req.params.id).exec();
        if (!VendorReviewObj) throw { status: 400, message: "VendorReview Not Found" };
        res.status(200).json({ message: "Review Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let VendorReviewObj: any = await VendorReview.findById(req.params.id).lean().exec();
        if (!VendorReviewObj) throw { status: 400, message: "VendorReview Not Found" };
        if (VendorReviewObj.countryId) {
            console.log(VendorReviewObj.countryId, "countryIdcountryId")
            VendorReviewObj.countryObj = await Country.findById(VendorReviewObj.countryId).exec();
        }
        res.status(200).json({ message: "Review Found", data: VendorReviewObj, success: true });
    } catch (err) {
        next(err);
    }
};
