"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNewsLetterById = exports.getAllNewsLetter = exports.addNewsLetter = void 0;
const newsletter_model_1 = require("../models/newsletter.model");
const sipCrm_service_1 = require("../service/sipCrm.service");
const addNewsLetter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let existsCheck = yield newsletter_model_1.NewsLetter.findOne({ email: req.body.email }).exec();
        if (existsCheck) {
            throw new Error("This email is already registered for our newsletter ");
        }
        let newLetterOb = yield new newsletter_model_1.NewsLetter(req.body).save();
        let crmObj = {
            PersonName: newLetterOb === null || newLetterOb === void 0 ? void 0 : newLetterOb.email,
            EmailID: newLetterOb === null || newLetterOb === void 0 ? void 0 : newLetterOb.email,
            MediumName: "Newsletter",
            SourceName: "app",
        };
        if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.SourceName) {
            crmObj.SourceName = (_b = req.body) === null || _b === void 0 ? void 0 : _b.SourceName;
        }
        yield (0, sipCrm_service_1.postSpiCrmLead)(crmObj);
        res.status(201).json({ message: "Thank you for subscribing to our newsletter" });
    }
    catch (error) {
        next(error);
    }
});
exports.addNewsLetter = addNewsLetter;
const getAllNewsLetter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {};
        if (req.query.userId) {
            query.userId = req.query.userId;
        }
        if (req.query.endDate) {
            query = Object.assign(Object.assign({}, query), { createdAt: { $lte: req.query.endDate, $gte: req.query.endDate } });
        }
        if (req.query.q) {
            query = Object.assign(Object.assign({}, query), { name: new RegExp(`${req.query.q}`, "i") });
        }
        let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
        let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;
        let NewsLetterArr = yield newsletter_model_1.NewsLetter.find(query)
            .skip((pageValue - 1) * limitValue)
            .limit(limitValue)
            .lean()
            .sort({ createdAt: -1 })
            .exec();
        let NewsLetterCount = yield newsletter_model_1.NewsLetter.find(query).countDocuments();
        res.status(201).json({ message: "found all NewsLetter", data: NewsLetterArr, NewsLetterCount });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllNewsLetter = getAllNewsLetter;
// export const getNewsLetterById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let existsCheck = await NewsLetter.findById(req.params.id).exec()
//         if (!existsCheck) {
//             throw new Error('NewsLetter does not exists');
//         }
//         res.status(201).json({
//             message: 'found all NewsLetter', data: existsCheck
//         });
//     } catch (error) {
//         next(error);
//     }
// };
// export const updateNewsLetterById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         let existsCheck = await NewsLetter.findById(req.params.id).exec()
//         if (!existsCheck) {
//             throw new Error('NewsLetter does not exists');
//         }
//         let NewsLetterObj = await NewsLetter.findByIdAndUpdate(req.params.id, req.body).exec()
//         res.status(201).json({ message: 'NewsLetter Updated' });
//     } catch (error) {
//         next(error);
//     }
// };
const deleteNewsLetterById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let existsCheck = yield newsletter_model_1.NewsLetter.findById(req.params.id).exec();
        if (!existsCheck) {
            throw new Error('NewsLetter does not exists');
        }
        let NewsLetterObj = yield newsletter_model_1.NewsLetter.findByIdAndDelete(req.params.id).exec();
        res.status(201).json({ message: 'NewsLetter Deleted' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteNewsLetterById = deleteNewsLetterById;
