import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { FlashSale } from "../models/FlashSale.model";
import { User } from "../models/user.model";
export const addFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let today = new Date();

    // const FlashSaleCheck = await FlashSale.findOne({
    //     productId: req.body.productId, userId: req.body.userId, $or: [
    //         { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.startDate } },
    //         { startDate: { $lte: req.body.endDate }, endDate: { $gte: req.body.endDate } },
    //         { startDate: { $gt: req.body.startDate }, endDate: { $lt: req.body.endDate } }
    //     ]
    // }).exec();

    const FlashSaleCheck = await FlashSale.findOne({
      productId: req.body.productId,
      $or: [
        { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.startDate } },
        { startDate: { $lte: req.body.endDate }, endDate: { $gte: req.body.endDate } },
        { startDate: { $gt: req.body.startDate }, endDate: { $lt: req.body.endDate } },
      ],
    }).exec();

    if (FlashSaleCheck)
      throw new Error(
        "Entry Already exist , cannot create new flash sale please change product or end date to create one "
      );

    let userObj: any = await User.findById(req.body.userId).exec();
    if (!userObj) {
      throw new Error("User not found !!!");
    }

    let dateDiff = dateDifference(req.body.startDate, req.body.endDate);

    if (userObj.saleDays - dateDiff <= 0) {
      throw new Error(
        "You do not have enough flash sales days left in you account to create this sale please reduce the duration of the sale or purchase a topup."
      );
    }

    await User.findByIdAndUpdate(userObj?._id, { $inc: { numberOfSales: -1, saleDays: -dateDiff } }).exec();

    console.log(req.body, "body")
    const newEntry = new FlashSale(req.body).save();

    if (!newEntry) {
      throw new Error("Unable to create FlashSale");
    }

    res.status(200).json({ message: "FlashSale Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let FlashSaleArr: any = [];

    FlashSaleArr = await FlashSale.find({ userId: req.params.id })
      .populate("productId")
      .populate("userId")
      .lean()
      .exec();

    res.status(200).json({ message: "getFlashSale", data: FlashSaleArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const getAllFlashSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let FlashSaleArr: any = [];

    let query: any = {};

    let saleCount = await FlashSale.find(query).countDocuments();

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    let pipeLine: any = [
      {
        "$lookup": {
          "from": "users",
          "localField": "userId",
          "foreignField": "_id",
          "as": "userId",
        },
      },
      {
        "$lookup": {
          "from": "products",
          "localField": "productId",
          "foreignField": "_id",
          "as": "productId",
        },
      },
      {
        "$unwind": {
          "path": "$productId",
          "preserveNullAndEmptyArrays": false,
        },
      },
      {
        "$unwind": {
          "path": "$userId",
          "preserveNullAndEmptyArrays": false,
        },
      },
    ];

    if (req.query.q) {
      pipeLine.push({
        "$match": {
          "$or": [
            {
              "userId.name": new RegExp(`^${req.query.q}`, "i"),
            },
            {
              "productId.name": new RegExp(`^${req.query.q}`, "i"),
            },
          ],
        },
      });
    }
    if (req.query.endDate) {
      pipeLine.push({
        "$match": 
            {
              "endDate":{
                "$gte": new Date(`${req.query.endDate}`)
              } 
            },
           
        },
      );
    }
    pipeLine.push(
      {
        "$skip": (pageValue - 1) * limitValue,
      },
      {
        "$limit": limitValue,
      }
    );

    FlashSaleArr = await FlashSale.aggregate(pipeLine).exec();
    // FlashSaleArr = await FlashSale.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).populate('productId').populate('userId').lean().exec();

    res.status(200).json({ message: "getFlashSale", data: FlashSaleArr, totalPages: saleCount, success: true });
  } catch (err) {
    next(err);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const FlashSaleObj = await FlashSale.findById(req.params.id).lean().exec();
    if (!FlashSaleObj) {
      throw new Error("FlashSale not found");
    }

    await FlashSale.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "FlashSale Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const FlashSaleObj = await FlashSale.findByIdAndDelete(req.params.id).exec();
    if (!FlashSaleObj) throw { status: 400, message: "FlashSale Not Found" };
    res.status(200).json({ message: "FlashSale Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let FlashSalesObj: any = await FlashSale.findOne({ _id: req.params.id })
      .populate("productId")
      .populate("userId")
      .lean()
      .exec();
    if (!FlashSalesObj) throw { status: 400, message: "FlashSale Not Found" };
    res.status(200).json({ message: "FlashSale Found", data: FlashSalesObj, success: true });
  } catch (err) {
    next(err);
  }
};
