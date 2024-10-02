import { NextFunction, Request, Response } from "express";
import { Notifications } from "../models/Notifications.model";


export const updateReadStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, notificationId } = req.body;
  
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "Invalid userId", success: false });
      }
  
      // Validate notificationId
      if (!notificationId || typeof notificationId !== 'string') {
        return res.status(400).json({ message: "Invalid notificationId", success: false });
      }
  
      // Check if notification exists
      const notification = await Notifications.findOne({ _id: notificationId, userId });
      if (!notification) {
        return res.status(404).json({ message: "Notification not found", success: false });
      }
      // Update notification to set isRead to true
      notification.isRead = true;
      await notification.save();
      // Return success response
      res.status(200).json({ message: "Notification marked as read", success: true });
    } catch (err) {
      next(err);
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

export const getUserNotificationCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let ProductArr: any = [];
    let query: any = {};

    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    // Always include isRead: false in the count query
    const countQuery = { ...query, isRead: false };

    if (req.query.isRead !== undefined) {
      query.isRead = req.query.isRead;
    }

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    ProductArr = await Notifications.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .sort({ createdAt: -1 })
      .exec();

    // Count only unread notifications
    let totalElements = await Notifications.countDocuments(countQuery).exec();

    console.log(totalElements, ProductArr?.length);

    res.status(200).json({
      message: "getProduct",
      data: ProductArr,
      totalElements: totalElements,
      success: true,
    });
  } catch (err) {
    next(err);
  }
};




