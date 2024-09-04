import { NextFunction, Request, Response } from "express";
import { NewsLetter } from "../models/newsletter.model";
import { postSpiCrmLead } from "../service/sipCrm.service";
export const addNewsLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existsCheck = await NewsLetter.findOne({ email: req.body.email }).exec();
    if (existsCheck) {
      throw new Error("This email is already registered for our newsletter ");
    }
    let newLetterOb = await new NewsLetter(req.body).save();

    let crmObj = {
      PersonName: newLetterOb?.email,
      EmailID: newLetterOb?.email,
      MediumName: "Newsletter",
      SourceName: "app",
    };

    if (req.body?.SourceName) {
      crmObj.SourceName = req.body?.SourceName;
    }
    await postSpiCrmLead(crmObj);
    res.status(201).json({ message: "Thank you for subscribing to our newsletter" });
  } catch (error) {
    next(error);
  }
};

export const getAllNewsLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {};

    if (req.query.userId) {
      query.userId = req.query.userId;
    }

        if (req.query.endDate) {
          query = { ...query, createdAt: { $lte: req.query.endDate, $gte: req.query.endDate } };
      }
    

        if (req.query.q) {
          query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
        }
    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;

    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    let NewsLetterArr = await NewsLetter.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .lean()
      .sort({ createdAt: -1 })
      .exec();

    let NewsLetterCount = await NewsLetter.find(query).countDocuments();

    res.status(201).json({ message: "found all NewsLetter", data: NewsLetterArr, NewsLetterCount });
  } catch (error) {
    next(error);
  }
};

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

export const deleteNewsLetterById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let existsCheck = await NewsLetter.findById(req.params.id).exec()
        if (!existsCheck) {
            throw new Error('NewsLetter does not exists');
        }
        let NewsLetterObj = await NewsLetter.findByIdAndDelete(req.params.id).exec()
        res.status(201).json({ message: 'NewsLetter Deleted' });
    } catch (error) {
        next(error);
    }
};
