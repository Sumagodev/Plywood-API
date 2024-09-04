import { NextFunction, Request, Response } from "express";
import { UserTickets } from "../models/UserTickets.model";
export const CreateTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {

        await new UserTickets(req.body).save()

        res.status(200).json({ message: "User Ticket Successfully Created", success: true });
    } catch (err) {
        next(err);
    }
};
export const getUserTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let query = {}
        if (req.query.userId) {
            query = { ...query, userId: req.query.userId }
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

        let userTicketArr = await UserTickets.find(query).skip(((pageValue - 1) * limitValue)).limit(limitValue).sort({ createdAt: -1 }).populate("userId").exec()
        let totalElements = await UserTickets.find(query).count().exec();
        console.log(userTicketArr)
        res.status(200).json({ message: "getUserTicket", data: userTicketArr, totalElements: totalElements, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    } catch (err) {
        next(err);
    }
};






export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let UserTicketObj: any = await UserTickets.findById(req.params.id).lean().exec();
        if (!UserTicketObj) throw { status: 400, message: "User Ticket Not Found" };
        res.status(200).json({ message: "UserTickets Found", data: UserTicketObj, success: true });
    } catch (err) {
        next(err);
    }
};


export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const TopupObj = await UserTickets.findByIdAndDelete(req.params.id).exec();
    if (!TopupObj) throw { status: 400, message: "Ticket Not Found" };
    res.status(200).json({ message: "Ticket Deleted", success: true });
  } catch (err) {
    next(err);
  }
};