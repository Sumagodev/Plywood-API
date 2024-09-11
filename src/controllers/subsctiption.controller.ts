import { NextFunction, Request, Response } from "express";
import { Subscription } from "../models/Subscription.model";
export const addSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const SubscriptionNameCheck = await Subscription.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (SubscriptionNameCheck) throw new Error("Entry Already exist please change name ");

        const newEntry = new Subscription(req.body).save();

        if (!newEntry) {
            throw new Error("Unable to create Subscription");
        }
        res.status(200).json({ message: "Subscription Successfully Created", success: true });
    } catch (err) {
        next(err);
    }
};
export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let SubscriptionArr: any = [];
        let query: any = {}
        console.log(req.query, "req.query.q")
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.SubscriptionId) {
        //   query.SubscriptionId = req.query.SubscriptionId;
        // }

         if (req.query.role) {
          query.role = req.query.role;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        let subscriptionCount = await Subscription.find(query).countDocuments();
        SubscriptionArr = await Subscription.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        // for (let Subscription of SubscriptionArr) {
        //   if (Subscription.SubscriptionId) {
        //     console.log(Subscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        //     Subscription.SubscriptionObj = await Subscription.findById(Subscription.SubscriptionId).exec();
        //   }
        // }

        res.status(200).json({ message: "getSubscription", data: SubscriptionArr, subscriptionCount, success: true });
    } catch (err) {
        next(err);
    }
};
export const getSubscriptionWithSubscriberCountApi = async (req: Request, res: Response, next: NextFunction) => {
    try {


        let pipeLine: any = [
            {
                '$addFields': {
                    'id': {
                        '$toString': '$_id'
                    }
                }
            }, {
                '$lookup': {
                    'from': 'usersubscriptions',
                    'localField': 'id',
                    'foreignField': 'subscriptionId',
                    'as': 'usersArr'
                }
            }, {
                '$project': {
                    'name': 1,
                    'description': 1,
                    'noOfMonth': 1,
                    'price': 1,
                    'numberOfSales': 1,
                    'saleDays': 1,
                    'advertisementDays': 1,
                    'numberOfAdvertisement': 1,
                    'usersCount': 1,
                    'usersArr': {
                        '$setUnion': '$usersArr.userId'
                    }
                }
            }, {
                '$addFields': {
                    'usersCount': {
                        '$size': '$usersArr'
                    }
                }
            }, {
                '$project': {
                    'name': 1,
                    'description': 1,
                    'noOfMonth': 1,
                    'price': 1,
                    'numberOfSales': 1,
                    'saleDays': 1,
                    'advertisementDays': 1,
                    'numberOfAdvertisement': 1,
                    'usersCount': 1
                }
            }
        ]





        if (req.query.q) {
            pipeLine.push({
                '$match': {
                    'name': new RegExp(`${req.query.q}`, "i")
                }
            })
        }


        let SubscriptionArr: any = [];
        let query: any = {}
        console.log(req.query, "req.query.q")
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.SubscriptionId) {
        //   query.SubscriptionId = req.query.SubscriptionId;
        // }

        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;


        pipeLine.push({
            '$skip': ((pageValue - 1) * limitValue),
        })


        pipeLine.push({
            '$limit': limitValue,
        })


        let subscriptionCount = await Subscription.find(query).countDocuments();
        SubscriptionArr = await Subscription.aggregate(pipeLine)
        // for (let Subscription of SubscriptionArr) {
        //   if (Subscription.SubscriptionId) {
        //     console.log(Subscription.SubscriptionId, "SubscriptionIdSubscriptionId")
        //     Subscription.SubscriptionObj = await Subscription.findById(Subscription.SubscriptionId).exec();
        //   }
        // }

        res.status(200).json({ message: "getSubscription", data: SubscriptionArr, subscriptionCount, success: true });
    } catch (err) {
        next(err);
    }
};



export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SubscriptionObj = await Subscription.findById(req.params.id).lean().exec();
        if (!SubscriptionObj) {
            throw new Error("Subscription not found");
        }

        await Subscription.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Subscription Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const SubscriptionObj = await Subscription.findByIdAndDelete(req.params.id).exec();
        if (!SubscriptionObj) throw { status: 400, message: "Subscription Not Found" };
        res.status(200).json({ message: "Subscription Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let SubscriptionObj: any = await Subscription.findById(req.params.id).lean().exec();
        if (!SubscriptionObj) throw { status: 400, message: "Subscription Not Found" };
        res.status(200).json({ message: "Subscription Found", data: SubscriptionObj, success: true });
    } catch (err) {
        next(err);
    }
};
