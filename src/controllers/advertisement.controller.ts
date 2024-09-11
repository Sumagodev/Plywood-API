import { NextFunction, Request, Response } from "express";
import { dateDifference } from "../helpers/dateUtils";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Advertisement } from "../models/AdvertisementSubscription.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { Product } from "../models/product.model";
export const addAdvertisementSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        // const AdvertisementSubscriptionNameCheck = await AdvertisementSubscription.findOne({
        //     name: new RegExp(`^${req.body.name}$`, "i"),
        // }).exec();
        // if (AdvertisementSubscriptionNameCheck) throw new Error("Entry Already exist please change name ");
        const FlashSaleCheck = await Advertisement.findOne({
            productId: req.body.productId, userId: req.body.userId, $or: [
                { startDate: { $lte: req.body.startDate }, endDate: { $gte: req.body.startDate } },
                { startDate: { $lte: req.body.endDate }, endDate: { $gte: req.body.endDate } },
                { startDate: { $gt: req.body.startDate }, endDate: { $lt: req.body.endDate } }
            ]
        }).exec();
        if (FlashSaleCheck) throw new Error("Entry Already exist, cannot create new advertisement please change product or dates to create one ");


        let userObj: any = await User.findById(req.body.userId).exec()
        if (!userObj) {
            throw new Error("User not found !!!");
        }
        if (req.body.image) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
        }


        let dateDiff = dateDifference(req.body.startDate, req.body.endDate);


        if ((userObj.advertisementDays - dateDiff) <= 0) {
            throw new Error("You do not have enough advertisement days left in you account to create this advertisement please reduce the duration of the advertisement or purchase a topup.")
        }

        await User.findByIdAndUpdate(userObj?._id, { $inc: { numberOfAdvertisement: -1, advertisementDays: -dateDiff } }).exec()


        if (req.body.endDate) {
            req.body.endDate = new Date(req.body.endDate);
            req.body.endDate.setHours(23, 59, 59, 59);
        }
        if (req.body.startDate) {
            req.body.startDate = new Date(req.body.startDate);
            req.body.startDate.setHours(0, 0, 0, 0);
        }

        const newEntry = new Advertisement(req.body).save();

        if (!newEntry) {
            throw new Error("Unable to create Advertisement Subscription");
        }
        res.status(200).json({ message: "Advertisement Subscription Successfully Created", success: true });
    } catch (err) {
        next(err);
    }
};
export const getAdvertisementSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let AdvertisementSubscriptionArr: any = [];
        let query: any = {}


        if (req.query.userId) {
            query.userId = req.query.userId;
        }

        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;

        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

        let AdvertisementsubscriptionCount = await Advertisement.find(query).countDocuments();

        AdvertisementSubscriptionArr = await Advertisement.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().sort({ createdAt: -1 }).populate("productId").populate("userId").exec();



        if (req.query.q) {
            AdvertisementSubscriptionArr = AdvertisementSubscriptionArr.filter((el: any) => `${el.productId.name}`.toLowerCase().includes(`${req.query.q}`.toLowerCase()) || `${el.userId.name}`.toLowerCase().includes(`${req.query.q}`.toLowerCase()) || `${el.message}`.toLowerCase().includes(`${req.query.q}`.toLowerCase()))
            // query = { ...query, $or: [{ name: new RegExp(`${req.query.q}`, "i") }] };
        }
        // for (let AdvertisementSubscription of AdvertisementSubscriptionArr) {
        //   if (AdvertisementSubscription.AdvertisementSubscriptionId) {
        //     console.log(AdvertisementSubscription.AdvertisementSubscriptionId, "AdvertisementSubscriptionIdAdvertisementSubscriptionId")
        //     AdvertisementSubscription.AdvertisementSubscriptionObj = await AdvertisementSubscription.findById(AdvertisementSubscription.AdvertisementSubscriptionId).exec();
        //   }
        // }

        res.status(200).json({ message: "get Advertisement Subscription", data: AdvertisementSubscriptionArr, AdvertisementsubscriptionCount, success: true });
    } catch (err) {
        next(err);
    }
};



// export const getAdvertisementSubscriptionForHomepage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let AdvertisementSubscriptionArr: any = [];
//         let query: any = {}
//         let today = new Date();
//         today.setHours(23, 59, 59, 59);
//         console.log(req.query, "req.query.q")
//         if (req.query.q) {
//             query.name = new RegExp(`${req.query.q}`, "i");
//         }

//         AdvertisementSubscriptionArr = await Advertisement.find().lean().exec();
//         // for (let AdvertisementSubscription of AdvertisementSubscriptionArr) {
//         //   if (AdvertisementSubscription.AdvertisementSubscriptionId) {
//         //     console.log(AdvertisementSubscription.AdvertisementSubscriptionId, "AdvertisementSubscriptionIdAdvertisementSubscriptionId")
//         //     AdvertisementSubscription.AdvertisementSubscriptionObj = await AdvertisementSubscription.findById(AdvertisementSubscription.AdvertisementSubscriptionId).exec();
//         //   }
//         // }

//         res.status(200).json({ message: "get Advertisement Subscription", data: AdvertisementSubscriptionArr, success: true });
//     } catch (err) {
//         next(err);
//     }
// };


export const getAdvertisementSubscriptionForHomepage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Initialize variables
        let AdvertisementSubscriptionArr: any = [];
        let query: any = {};

        // Check for search query
        if (req.query.q) {
            query.name = new RegExp(req.query.q as string, "i");
        }

        // Find all advertisements with query
        const advertisements = await Advertisement.find(query).lean().exec();

        // Collect userIds and productIds
        const userIds = advertisements.map(ad => ad.userId);
        const productIds = advertisements.map(ad => ad.productId);

        // Fetch users and products in parallel
        const users = await User.find({ _id: { $in: userIds } }).lean().exec();
        const products = await Product.find({ _id: { $in: productIds } }).lean().exec();

        // Create maps for city names and product prices
        const cityMap = new Map<string, string>();
        const productMap = new Map<string, string>();

        // Populate cityMap
        for (const user of users) {
            cityMap.set(user._id.toString(), user.cityId.toString());
        }

        // Populate productMap
        // for (const product of products) {
        //     productMap.set(product._id.toString(), product.price);
        // }

        // Fetch cities based on city IDs
        const cityIds = Array.from(new Set(cityMap.values())); // Unique cityIds
        const cities = await City.find({ _id: { $in: cityIds } }).lean().exec();
        const cityNameMap = new Map<string, string>(cities.map(city => [city._id.toString(), city.name]));

        // Enhance advertisements with city names and product prices
        AdvertisementSubscriptionArr = advertisements.map(ad => {
            const cityId = cityMap.get(ad.userId.toString());
            const cityName = cityId ? cityNameMap.get(cityId) || 'Unknown City' : 'Unknown City';
            const price = productMap.get(ad.productId.toString()) || 'N/A';

            return {
                ...ad,
                cityName,
                price
            };
        });

        res.status(200).json({
            message: "Get Advertisement Subscription",
            data: AdvertisementSubscriptionArr,
            success: true
        });
    } catch (err) {
        next(err);
    }
};
export const updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const AdvertisementSubscriptionObj = await Advertisement.findById(req.params.id).lean().exec();
        if (!AdvertisementSubscriptionObj) {
            throw new Error("Advertisement Subscription not found");
        }

        if (req.body.image && req.body.image.includes("base64")) {
            req.body.image = await storeFileAndReturnNameBase64(req.body.image);
        }
        await Advertisement.findByIdAndUpdate(req.params.id, req.body).exec();

        res.status(200).json({ message: "Advertisement Subscription Updated", success: true });
    } catch (err) {
        next(err);
    }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const AdvertisementSubscriptionObj = await Advertisement.findByIdAndDelete(req.params.id).exec();
        if (!AdvertisementSubscriptionObj) throw { status: 400, message: "Advertisement Subscription Not Found" };
        res.status(200).json({ message: "Advertisement Subscription Deleted", success: true });
    } catch (err) {
        next(err);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let AdvertisementSubscriptionObj: any = await Advertisement.findById(req.params.id).lean().exec();
        if (!AdvertisementSubscriptionObj) throw { status: 400, message: "Advertisement Subscription Not Found" };
        res.status(200).json({ message: "Advertisement Subscription Found", data: AdvertisementSubscriptionObj, success: true });
    } catch (err) {
        next(err);
    }
};
