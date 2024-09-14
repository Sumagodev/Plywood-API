import { NextFunction, Request, Response } from "express";
import { Country } from "../models/country.model";
import { ProductReview } from "../models/productReview.model";
import { Product } from "../models/product.model";
import { User } from "../models/user.model";
import { UserFcmToken } from "../models/UserFcmTokens.model";
import { Notifications } from "../models/Notifications.model";
import { fcmMulticastNotify } from "../helpers/fcmNotify";
import { notification_text } from "../helpers/constant";
// export const addProductReview = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         console.log(req.body);
//         // const ProductReviewNameCheck = await ProductReview.findOne({
//         //     name: new RegExp(`^${req.body.name}$`, "i"), productId: req.body.productId
//         // }).exec();
//         // if (ProductReviewNameCheck) throw new Error("You have already added a review for this product");

//         console.log(req.body)
//         const newEntry = new ProductReview(req.body).save();

//         if (!newEntry) {
//             throw new Error("Unable to create ProductReview");
//         }


//         // let userObj = await User.findById(req.body?.userId).exec();
//         let reviewArr = await ProductReview.find({ userId: req.body?.userId }).exec();

//         let total = reviewArr && reviewArr.length > 0 ? reviewArr.length : 0;
//         let totalRatings = reviewArr && reviewArr.length > 0 ? reviewArr.reduce((acc, el) => acc + el.rating, 0) : 0
//         console.log(totalRatings, total, "totalRatings")
//         let rating: number = 0;

//         if (totalRatings != 0 && total != 0) {
//             rating = Math.round(totalRatings / total);
//         }

//         // Math.round((typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0);
//         // console.log(rating, (typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0, '(typeof (totalRatings / total) == "number" || typeof (totalRatings / total) == "bigint") ? (totalRatings / total) : 0');
//         await User.findByIdAndUpdate(req.body?.userId, { rating: rating }).exec();
//         // await Product.findByIdAndUpdate(req.body.productId, { "createdByObj.rating": rating }).exec();

//         let fcmTokensArr = await UserFcmToken.find({ userId: req.body.userId }).exec();
//         console.log(fcmTokensArr)
//         let obj = {
//             tokens: fcmTokensArr.map((el:any) => el.fcmToken),
//             data: { title: notification_text.review_text_obj.title, content: notification_text.review_text_obj.content }
//         }
//         let saveNotificationObj = {
//             userId: req.body.userId,
//             title: obj.data.title,
//             content: obj.data.content
//         }
//         await new Notifications(saveNotificationObj).save()

//         console.log(saveNotificationObj, "NOTIFICATION OBJ")
//         await fcmMulticastNotify(obj)



//         res.status(200).json({ message: "Review Successfully Created", success: true });
//     } catch (err) {
//         next(err);
//     }
// };
export const addProductReview = async (req: Request, res: Response, next: NextFunction) => {
  try {

      console.log(req.body);
      // const ProductReviewNameCheck = await ProductReview.findOne({
      //     name: new RegExp(`^${req.body.name}$`, "i"), productId: req.body.productId
      // }).exec();
      // if (ProductReviewNameCheck) throw new Error("You have already added a review for this product");

      console.log(req.body)
      const newEntry = new ProductReview(req.body).save();

      if (!newEntry) {
          throw new Error("Unable to create ProductReview");
      }


      // let userObj = await User.findById(req.body?.userId).exec();
      let reviewArr = await ProductReview.find({ userId: req.body?.userId }).exec();

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
      // await Product.findByIdAndUpdate(req.body.productId, { "createdByObj.rating": rating }).exec();

      let fcmTokensArr = await UserFcmToken.find({ userId: req.body.userId }).exec();
      console.log(fcmTokensArr)
      let obj = {
          tokens: fcmTokensArr.map((el:any) => el.fcmToken),
          data: { title: notification_text.review_text_obj.title, content: notification_text.review_text_obj.content }
      }
      let saveNotificationObj = {
          userId: req.body.userId,
          title: obj.data.title,
          content: obj.data.content
      }
      await new Notifications(saveNotificationObj).save()

      console.log(saveNotificationObj, "NOTIFICATION OBJ")
      await fcmMulticastNotify(obj)



      res.status(200).json({ message: "Review Successfully Created", success: true });
  } catch (err) {
      next(err);
  }
};
export const getProductReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {};

    // Build the query based on the request query parameters
    if (req.query.productId) {
      query = { ...query, productId: req.query.productId };
    }
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
    let categoryCount = await ProductReview.find(query).countDocuments();

    // Pagination settings
    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    // Fetch the reviews, populating both product and user details (including profileImage)
    let ProductReviewArr = await ProductReview.find(query)
      .populate("productId") // Populate product details
      .populate({
        path: "userId", // Populate user details
        select: "profileImage name", // Fetch the user's profileImage and name
        model: User, // Specify the User model
      })
      .skip((pageValue - 1) * limitValue)
      .sort({ createdAt: -1 })
      .limit(limitValue)
      .lean()
      .exec();

    // Respond with the product reviews and the populated data
    res.status(200).json({
      message: "getProductReview",
      data: ProductReviewArr,
      count: categoryCount,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};




export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ProductReviewObj = await ProductReview.findById(req.params.id).lean().exec();
        if (!ProductReviewObj) {
            throw new Error("Review not found");
        }


        await ProductReview.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Review Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ProductReviewObj = await ProductReview.findByIdAndDelete(req.params.id).exec();
        if (!ProductReviewObj) throw { status: 400, message: "ProductReview Not Found" };
        res.status(200).json({ message: "Review Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let ProductReviewObj: any = await ProductReview.findById(req.params.id).lean().exec();
        if (!ProductReviewObj) throw { status: 400, message: "ProductReview Not Found" };
        if (ProductReviewObj.countryId) {
            console.log(ProductReviewObj.countryId, "countryIdcountryId")
            ProductReviewObj.countryObj = await Country.findById(ProductReviewObj.countryId).exec();
        }
        res.status(200).json({ message: "Review Found", data: ProductReviewObj, success: true });
    } catch (err) {
        next(err);
    }
};
