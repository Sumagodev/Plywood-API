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



