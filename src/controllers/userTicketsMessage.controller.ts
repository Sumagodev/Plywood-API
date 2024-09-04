import { NextFunction, Request, Response } from "express";
import { UserTickets } from "../models/UserTickets.model";
import { UserTicketsMessage } from "../models/userTicketMessages.model";
export const CreateTicketMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {

        await new UserTicketsMessage(req.body).save()

        res.status(200).json({ message: "Your message is successfully sent to us , we will get back to you with a solution as soon as possible", success: true });
    } catch (err) {
        next(err);
    }
};
export const getUserTicketMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let query = {}


        let userTicketObj: any = await UserTickets.findById(req.params.id).lean().exec()


        if (!userTicketObj) {
            throw new Error("Lead not found !!!");
        }

        let ticketMessageArr = await UserTicketsMessage.find({ userTicketsId: userTicketObj?._id }).exec()
        if (ticketMessageArr) {
            userTicketObj.ticketMessageArr = ticketMessageArr
        }


        res.status(200).json({ message: "getUserTicket", data: userTicketObj, success: true });
        // res.status(200).json({ message: "getUserTicket", data: UserTicketArr, success: true });
    } catch (err) {
        next(err);
    }
};
