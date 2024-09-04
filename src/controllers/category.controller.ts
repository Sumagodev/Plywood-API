import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { APPROVED_STATUS } from "../helpers/constant";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { string_to_slug } from "./../helpers/stringify";
export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const CategoryNameCheck = await Category.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
    }).exec();
    if (CategoryNameCheck) throw new Error("Entry Already exist please change name or url");
    let obj = {};
    if (req.body.image) {
      req.body.image = await storeFileAndReturnNameBase64(req.body.image);
    }

    if (req.body.bannerImage) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }
    if (req.body.parentCategoryId) {
      const categoryObj = await Category.findById(req.body.parentCategoryId).lean().exec();
      if (!categoryObj) {
        throw new Error("Parent Category not found");
      }

      const parentCategoryArr = [...categoryObj.parentCategoryArr];
      parentCategoryArr.push({ parentId: categoryObj._id });
      if (req.body.name) {
        req.body.slug = await string_to_slug(req.body.name);
      }
      obj = {
        ...req.body,
        level: categoryObj.level + 1,
        parentCategoryArr,
      };
    } else {
      const categoryCount = await Category.countDocuments({ level: 1 }).exec();
      obj = { ...req.body, order: categoryCount + 1, level: 1 };
    }
    const newEntry = new Category(obj).save();

    if (!newEntry) {
      throw new Error("Unable to create Category");
    }
    res.status(200).json({ message: "Category Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {};

    if (req.query.level) {
      query.level = req.query.level;
    }

    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
    }

    let categoryCount = await Category.find(query).countDocuments();

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    let categoryArr: any = [];
    categoryArr = await Category.find(query)
      .skip((pageValue - 1) * limitValue)
      .limit(limitValue)
      .lean()
      .exec();
    // if (req.query.level) {
    // } else {
    // categoryArr = await Category.find().skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
    // }

    for (const el of categoryArr) {
      // console.log(el);
      if (el.parentCategoryId) {
        const parentObj = await Category.findById(el.parentCategoryId).lean().exec();
        if (parentObj) {
          el.parentCategoryName = parentObj.name;
        }
      }
      if (req.query.products) {
        let pquery: any = { "categoryArr.categoryId": el._id, approved: APPROVED_STATUS.APPROVED };
        if (req.query.role) {
          pquery = { ...pquery, "createdByObj.role": { $ne: req.query.role } };
        }

        let productArr = await Product.find(pquery).limit(4).exec();
        el.productArr = productArr;
      }
    }

    console.log(categoryCount, "categoryCount");

    res.status(200).json({ message: "getCategory", data: categoryArr, count: categoryCount, success: true });
  } catch (err) {
    next(err);
  }
};

export const getChildCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let categoryArr: any = [];
    if (req.query.level) {
      categoryArr = await Category.find({ level: `${req.query.level}` })
        .lean()
        .exec();
    } else {
      categoryArr = await Category.find({ level: 1 }).lean().exec();
    }
    for (const el of categoryArr) {
      console.log(el);
      if (el.parentCategoryId) {
        const parentObj = await Category.findById(el.parentCategoryId).lean().exec();
        if (parentObj) {
          el.parentCategoryName = parentObj.name;
        }
      }
    }
    res.status(200).json({ message: "getCategory", data: categoryArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let obj = {};
    if (req.body.image && `${req.body.image}`.includes("data:image")) {
      req.body.image = await storeFileAndReturnNameBase64(req.body.image);
    }

    if (req.body.name) {
      req.body.slug = await string_to_slug(req.body.name);
    }

    if (req.body.bannerImage && `${req.body.bannerImage}`.includes("data:image")) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }

    if (req.body.parentCategoryId) {
      const categoryObj = await Category.findById(req.body.parentCategoryId).lean().exec();
      if (!categoryObj) {
        throw new Error("Parent Category not found");
      }
      const parentCategoryArr = [...categoryObj.parentCategoryArr];
      parentCategoryArr.push({ parentId: categoryObj._id });
      obj = {
        ...req.body,
        level: categoryObj.level + 1,
        parentCategoryArr,
      };
    } else {
      const categoryCount = await Category.countDocuments({ level: 1 }).exec();
      obj = { ...req.body, order: categoryCount + 1, level: 1 };
    }
    await Category.findByIdAndUpdate(req.params.id, obj).exec();

    res.status(200).json({ message: "category Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryObj = await Category.findByIdAndDelete(req.params.id).exec();
    if (!categoryObj) throw { status: 400, message: "category Not Found" };
    res.status(200).json({ message: "category Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryObj = await Category.findById(req.params.id).exec();
    if (!categoryObj) throw { status: 400, message: "category Not Found" };

    res.status(200).json({ message: "category Found", data: categoryObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const getNameBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryObj = await Category.findOne({ slug: req.params.id }).exec();
    if (!categoryObj) throw { status: 400, message: "category Not Found" };

    res.status(200).json({ message: "category Found", data: categoryObj, success: true });
  } catch (err) {
    next(err);
  }
};
export const getNestedCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let mainCategoryArr = await Category.find().lean().exec();
    let firstFilteArr = mainCategoryArr.filter((el) => el.name == "Plywood & MDF");
    let restFilteArr = mainCategoryArr.filter((el) => el.name != "Plywood & MDF");
    mainCategoryArr = [...firstFilteArr, ...restFilteArr];
    // console.log(mainCategoryArr, "mainCategoryArr");
    const setSubcategoryArr: any = (id: string | null | undefined | Types.ObjectId) => {
      if (!id) return [];
      const tempArr = mainCategoryArr.filter((el) => el.parentCategoryId == `${id}`);
      if (tempArr.length == 0) return [];
      return tempArr.map((el) => {
        const obj = {
          ...el,
          label: el.name,
          value: el._id,
          subCategoryArr: setSubcategoryArr(el._id),
          isExpanded: true,
        };
        return obj;
      });
    };
    const finalArr = mainCategoryArr
      .filter((el) => el.level == 1)
      .map((el) => {
        const obj = {
          ...el,
          label: el.name,
          value: el._id,
          subCategoryArr: setSubcategoryArr(el._id),
          isExpanded: true,
        };
        return obj;
      });
    res.status(200).json({ message: "Category Arr", data: finalArr, success: true });
  } catch (err) {
    next(err);
  }
};
