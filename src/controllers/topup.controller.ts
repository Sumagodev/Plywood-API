import { NextFunction, Request, Response } from "express";
import { Topup } from "../models/Topup.model";
export const addTopup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        const TopupNameCheck = await Topup.findOne({
            name: new RegExp(`^${req.body.name}$`, "i"),
        }).exec();
        if (TopupNameCheck) throw new Error("Entry Already exist please change name ");

        const newEntry = new Topup(req.body).save();

        if (!newEntry) {
            throw new Error("Unable to create Topup");
        }
        res.status(200).json({ message: "Topup purchased successfully", success: true });
    } catch (err) {
        next(err);
    }
};
export const getTopup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let TopupArr: any = [];
        let query: any = {}
        console.log(req.query, "req.query.q")
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.TopupId) {
        //   query.TopupId = req.query.TopupId;
        // }

        if (req.query.role) {
            query.role = req.query.role;
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
        let TopupCount = await Topup.find(query).countDocuments();
        TopupArr = await Topup.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
        // for (let Topup of TopupArr) {
        //   if (Topup.TopupId) {
        //     console.log(Topup.TopupId, "TopupIdTopupId")
        //     Topup.TopupObj = await Topup.findById(Topup.TopupId).exec();
        //   }
        // }

        res.status(200).json({ message: "getTopup", data: TopupArr, TopupCount, success: true });
    } catch (err) {
        next(err);
    }
};
export const getTopupWithSubscriberCountApi = async (req: Request, res: Response, next: NextFunction) => {
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
                    'from': 'userTopups',
                    'localField': 'id',
                    'foreignField': 'TopupId',
                    'as': 'usersArr'
                }
            }, {
                '$project': {
                    'name': 1,
                    'description': 1,
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


        let TopupArr: any = [];
        let query: any = {}
        console.log(req.query, "req.query.q")
        if (req.query.q) {
            query.name = new RegExp(`${req.query.q}`, "i");
        }
        // if (req.query.TopupId) {
        //   query.TopupId = req.query.TopupId;
        // }

        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;


        pipeLine.push({
            '$skip': ((pageValue - 1) * limitValue),
        })


        pipeLine.push({
            '$limit': limitValue,
        })


        let TopupCount = await Topup.find(query).countDocuments();
        TopupArr = await Topup.aggregate(pipeLine)
        // for (let Topup of TopupArr) {
        //   if (Topup.TopupId) {
        //     console.log(Topup.TopupId, "TopupIdTopupId")
        //     Topup.TopupObj = await Topup.findById(Topup.TopupId).exec();
        //   }
        // }

        res.status(200).json({ message: "getTopup", data: TopupArr, TopupCount, success: true });
    } catch (err) {
        next(err);
    }
};



export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const TopupObj = await Topup.findById(req.params.id).lean().exec();
        if (!TopupObj) {
            throw new Error("Topup not found");
        }

        await Topup.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Topup Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const TopupObj = await Topup.findByIdAndDelete(req.params.id).exec();
        if (!TopupObj) throw { status: 400, message: "Topup Not Found" };
        res.status(200).json({ message: "Topup Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let TopupObj: any = await Topup.findById(req.params.id).lean().exec();
        if (!TopupObj) throw { status: 400, message: "Topup Not Found" };
        res.status(200).json({ message: "Topup Found", data: TopupObj, success: true });
    } catch (err) {
        next(err);
    }
};
