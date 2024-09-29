import { NextFunction, Request, RequestHandler, Response } from "express";
import mongoose, { Number, Types } from "mongoose";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Product } from "../models/product.model";
import { string_to_slug } from "../helpers/stringify";
import { Category } from "../models/category.model";
import { Brand } from "../models/brand.model";
import { User } from "../models/user.model";
import { FlashSale } from "../models/FlashSale.model";
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.user, "useruseruseruser");
    // const ProductNameCheck = await Product.findOne({
    //   name: new RegExp(`^${req.body.name}$`, "i"),
    // }).exec();
    // if (ProductNameCheck) throw new Error("Entry Already exist please change product name ");
    let obj = {};
    if (req.body.image) {
      req.body.mainImage = await storeFileAndReturnNameBase64(req.body.image);
    }
    if (req.body.name) {
      req.body.slug = await string_to_slug(req.body.name);
    }
    let userDataObj = await User.findById(req?.user?.userId).exec();
    if (!userDataObj) {
      throw new Error("You are not authorised to create this product");
    }

    if (req.user) {
      let userobj = {
        ...userDataObj,
        role: req.user.role,
      };
      console.log(req.user.userId, "req.user.userId", req.user, "req.user")
      req.body.createdById = req.user.userId;
      req.body.createdByObj = userobj;

      console.log(userDataObj?.subscriptionEndDate, "userObjuserObjuserObj")
      if (userDataObj?.subscriptionEndDate) {
        let subscriptionEndDate = new Date(userDataObj?.subscriptionEndDate);
        let currentDate = new Date();
        if ((subscriptionEndDate.getTime() < currentDate.getTime())) {
          req.body.status = true
        }

      }

    }

    if (req.body.categoryArr) {
      for (let el of req.body.categoryArr) {
        let categoryObj = await Category.findById(el.categoryId).lean().exec();

        if (!categoryObj) throw { message: "Product Category not found" };
      }
    }

    if (req.body.imageArr) {
      if (req.body.imageArr && req.body.imageArr.length > 3) {
        throw new Error("Cannot add more than 3 images")
      }
      for (const el of req.body.imageArr) {
        if (el.image != "") {
          el.image = await storeFileAndReturnNameBase64(el.image);
        }
      }
    }
    const newEntry = new Product(req.body).save();

    if (!newEntry) {
      throw new Error("Unable to create Product");
    }
    res.status(200).json({ message: "Product Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let ProductArr: any = [];

    let query: any = {};

    if (req.query.userId) {
      query.createdById = req.query.userId;
    }

    if (req.query.searchQuery) {
      query = { ...query, name: new RegExp(`${req.query.searchQuery}`, "i") };
    }
    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
    }

    let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

    if (req.query.category) {
      query = { ...query, "categoryArr.categoryId": req.query.category };
    }
    if (req.query.role && req.query.role != null && req.query.role != "null") {
      query = { ...query, "createdByObj.role": { $ne: req.query.role } };
    }
    if (req.query.users) {
      let usersArr = `${req.query.users}`.split(",");
      console.log(usersArr, "usersArr")
      query = { ...query, "createdById": { $in: [...usersArr.map(el => new mongoose.Types.ObjectId(el))] } };
    }
    if (req.query.categories) {
      let categoryArr = `${req.query.categories}`.split(",");
      query = { ...query, "categoryArr.categoryId": { $in: [...categoryArr] } };
    }
    if (req.query.locations) {
      let locationArr = `${req.query.locations}`.split(",");
      query = { ...query, "createdByObj.cityId": { $in: [...locationArr] } };
    }
    if (req.query.city) {
      let locationArr = `${req.query.city}`.split(",");
      query = { ...query, "createdByObj.state": { $in: [...locationArr] } };
    }
    if (req.query.rating) {
      let ratingValue: number = +req.query.rating;
      query = { ...query, "createdByObj.rating": { $gte: ratingValue } };
    }
    if (req.query.vendors) {
      let vendorArr: any = `${req.query.vendors}`.split(",");
      query = { ...query, $or: vendorArr.map((el: any) => ({ "brand": el })) };
    }
    if (req.query.minPrice) {
      if (query.sellingprice) {
        query = { ...query, sellingprice: { ...query.sellingprice, $gte: req.query.minPrice } };
      } else {
        query = { ...query, sellingprice: { $gte: req.query.minPrice } };
      }
    }
    if (req.query.maxPrice) {
      let maxPrice: number = +req.query.maxPrice;
      if (query.sellingprice) {
        query = { ...query, sellingprice: { ...query.sellingprice, $lte: maxPrice } };
      } else {
        query = { ...query, sellingprice: { $lte: maxPrice } };
      }
    }

    console.log(query);

    ProductArr = await Product.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).exec();

    let totalElements = await Product.find(query).count().exec();

    console.log(totalElements, ProductArr?.length);

    res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
  } catch (err) {
    next(err);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body)
    const ProductObj = await Product.findById(req.params.id).lean().exec();
    if (!ProductObj) {
      throw new Error(" Product not found");
    }
    let obj = {};
    if (req.body.image && `${req.body.image}`.includes("base64")) {
      req.body.mainImage = await storeFileAndReturnNameBase64(req.body.image);
    }

    if (req.body.name) {
      req.body.slug = await string_to_slug(req.body.name);
    }
    if (req.body.categoryArr) {
      for (let el of req.body.categoryArr) {
        let categoryObj = await Category.findById(el.categoryId).lean().exec();
        if (!categoryObj) throw { message: "Product Category not found" };
      }
    }
    if (req.body.imageArr && req.body.imageArr.length > 0) {
      if (req.body.imageArr && req.body.imageArr > 3) {
        throw new Error("Cannot add more than 3 images")
      }
      for (const el of req.body.imageArr) {
        if (el.image != "" && `${el.image}`.includes("base64")) {
          console.log(`${el.image}`.includes("base64"), `${el.image}`.includes("base64"));
          el.image = await storeFileAndReturnNameBase64(el.image);
        } else {
          if (el.image == "") {
            req.body.imageArr.splice(
              req.body.imageArr.findIndex((a: any) => a.id === el.id),
              1
            );
          }
        }
      }
    } else {
      delete req.body.imageArr;
    }

    console.log(req.body.bannerImage, "req.body.bannerImage")
    if (req.body.bannerImage && req.body.bannerImage != "" && `${req.body.bannerImage}`.includes("base64")) {
      console.log("ASDASDASDASDAS")
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }
    if (req.body.image && req.body.image != "" && `${req.body.image}`.includes("base64")) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.image);
    }

    await Product.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "Product Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductObj = await Product.findByIdAndDelete(req.params.id).exec();
    if (!ProductObj) throw { status: 400, message: "Product Not Found" };
    res.status(200).json({ message: "Product Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductObj = await Product.findById(req.params.id).exec();
    console.log(ProductObj)
    if (!ProductObj) throw { status: 400, message: "Product Not Found" };

    res.status(200).json({ message: "Product Found", data: ProductObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();

    let ProductObj: any = await Product.findOne({ slug: req.params.id }).lean().exec();
    if (!ProductObj) throw { status: 400, message: "Product Not Found" };

    console.log(ProductObj.brandId, "ProductObj.brandObjProductObj.brandObj");
    if (ProductObj.brand) {
      ProductObj.brandObj = await Brand.findById(ProductObj.brand).lean().exec();
    }

    if (ProductObj?.createdByObj._id) {
      ProductObj.createdByObj.userObj = await User.findById(ProductObj?.createdByObj?._id).lean().exec();
    }
    console.log(ProductObj._id, "CHECK THIS");
    const flashSaleObj = await FlashSale.findOne({ productId: ProductObj._id, startDate: { $gte: today } })
      .lean()
      .exec();
    if (flashSaleObj) {
      ProductObj.flashSaleObj = flashSaleObj;
      console.log(flashSaleObj);
      ProductObj.sellingprice = flashSaleObj?.salePrice;
    }
    res.status(200).json({ message: "Product Found", data: ProductObj, success: true });
  } catch (err) {
    next(err);
  }
};

export const getSimilarProducts: RequestHandler = async (req, res, next) => {
  try {
    const productArr = await Product.find({ categoryId: new mongoose.Types.ObjectId(req.params.id) }).exec();
    if (!productArr) throw new Error("Products not found");

    res.status(200).json({ message: "Products", data: productArr, success: true });
  } catch (error) {
    next(error);
  }
};


export const getAllProductsBySupplierId: RequestHandler = async (req, res, next) => {
  try {
    console.log("!@@");
    const productArr = await Product.find({ createdById: req.params.id, approved: "APPROVED" }).exec();
    if (!productArr) throw new Error("Products not found");

    res.status(200).json({ message: "Products", data: productArr, success: true });
  } catch (error) {
    next(error);
  }
};

export const searchProductWithQuery: RequestHandler = async (req, res, next) => {
  try {

    let query: any = {};
    if (req.query.role && !req.query.role == null) {
      query = { ...query, "createdByObj.role": { $ne: req.query.role } };
    }

    if (req.query.name) {
      query = {
        ...query, $or: [
          { name: new RegExp(`${req.query.name}`, "i") },
          { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
          { "shortDescription": new RegExp(`${req.query.name}`, "i") },
          { "longDescription": new RegExp(`${req.query.name}`, "i") },

        ]
      };
      // { "brandId": new RegExp(`${req.query.name}`, "i") },
      let brandArr = await Brand.find({ name: new RegExp(`${req.query.name}`, "i") }).exec()
      if (brandArr && brandArr.length > 0) {
        query = {
          ...query, $or: [
            { name: new RegExp(`${req.query.name}`, "i") },
            { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
            { "shortDescription": new RegExp(`${req.query.name}`, "i") },
            { "longDescription": new RegExp(`${req.query.name}`, "i") },
            { "brand": { $in: [...brandArr.map(el => `${el._id}`)] } },

          ]
        }
      }
    }

    console.log(JSON.stringify(query, null, 2), "query")

    const arr = await Product.find(query).select({ name: 1, _id: 1, slug: 1 })
      .lean()
      .exec();
    res.status(200).json({ message: "Arr", data: arr, success: true });
  } catch (error) {
    next(error);
  }
};


export const updateAppById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductObj = await Product.findById(req.params.id).lean().exec();
    if (!ProductObj) {
      throw new Error(" Product not found");
    }
    let obj = {};
    if (req.body.image && `${req.body.image}`.includes("data:image")) {
      req.body.mainImage = await storeFileAndReturnNameBase64(req.body.image);
    }

    if (req.body.name) {
      req.body.slug = await string_to_slug(req.body.name);
    }
    if (req.body.categoryArr) {
      for (let el of req.body.categoryArr) {
        let categoryObj = await Category.findById(el.categoryId).lean().exec();
        if (!categoryObj) throw { message: "Product Category not found" };
      }
    }
    if (req.body.imageArr && req.body.imageArr.length > 0) {
      if (req.body.imageArr && req.body.imageArr > 3) {
        throw new Error("Cannot add more than 3 images")
      }
      for (const el of req.body.imageArr) {
        if (el.image != "" && `${el.image}`.includes("base64")) {
          console.log(`${el.image}`.includes("base64"), `${el.image}`.includes("base64"));
          el.image = await storeFileAndReturnNameBase64(el.image);
        } else {
          if (el.image == "") {
            req.body.imageArr.splice(
              req.body.imageArr.findIndex((a: any) => a.id === el.id),
              1
            );
          }
        }
      }
    } else {
      delete req.body.imageArr;
    }


    if (req.body.bannerImage && `${req.body.bannerImage}`.includes("data:image")) {
      req.body.bannerImage = await storeFileAndReturnNameBase64(req.body.bannerImage);
    }

    await Product.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "Product Updated", success: true });
  } catch (err) {
    next(err);
  }
};

export const getTopSellingProducts: RequestHandler = async (req, res, next) => {
  try {
    const topSellingProducts = await Product.find()
      .sort({ sellingprice: -1 }) // Sort by sellingprice in descending order
      .limit(10); // Limit to top 10 products (or however many you want)

    res.status(200).json({ message: "Top Selling Products", data: topSellingProducts, success: true });
  } catch (error) {
    next(error);
  }
};
