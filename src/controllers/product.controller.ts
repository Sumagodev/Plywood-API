import { NextFunction, Request, RequestHandler, Response } from "express";
import mongoose, { Number, Types } from "mongoose";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Product } from "../models/product.model";
import { string_to_slug } from "../helpers/stringify";
import { Category } from "../models/category.model";
import { Brand } from "../models/brand.model";
import { User } from "../models/user.model";
import { City } from "../models/City.model";
import { State } from "../models/State.model";
import { FlashSale } from "../models/FlashSale.model";


export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    if (req.query.role && req.query.role != "null") {
      query = { ...query, "createdByObj.role": { $ne: req.query.role } };
    }

    if (req.query.users) {
      let usersArr = `${req.query.users}`.split(",");
      query = { ...query, "createdById": { $in: usersArr.map(el => new mongoose.Types.ObjectId(el)) } };
    }

    if (req.query.categories) {
      let categoryArr = `${req.query.categories}`.split(",");
      query = { ...query, "categoryArr.categoryId": { $in: categoryArr } };
    }

    if (req.query.locations) {
      let locationArr = `${req.query.locations}`.split(",");
      query = { ...query, "createdByObj.cityId": { $in: locationArr } };
    }

    if (req.query.city) {
      let locationArr = `${req.query.city}`.split(",");
      query = { ...query, "createdByObj.state": { $in: locationArr } };
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
      query.sellingprice = query.sellingprice || {};
      query.sellingprice.$gte = req.query.minPrice;
    }

    if (req.query.maxPrice) {
      query.sellingprice = query.sellingprice || {};
      query.sellingprice.$lte = +req.query.maxPrice;
    }

    // Fetch the products based on the query
    const products = await Product.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();

    const userIds = products.map(product => product?.createdById).filter(Boolean); // Ensure no undefined values

    // Fetch users based on the createdById in the products
    const users = await User.find({ _id: { $in: userIds } }).lean().exec();

    // Create maps for city and state names
    const cityIds = Array.from(new Set(users.map(user => user?.cityId).filter(Boolean)));
    const stateIds = Array.from(new Set(users.map(user => user?.stateId).filter(Boolean)));

    const cities = await City.find({ _id: { $in: cityIds } }).lean().exec();
    const states = await State.find({ _id: { $in: stateIds } }).lean().exec();

    const cityNameMap = new Map(cities.map(city => [city._id.toString(), city.name]));
    const stateNameMap = new Map(states.map(state => [state._id.toString(), state.name]));

    // Add city and state names, product image, price, verification status, and phone to the products
    const populatedProducts = products.map(product => {
      const createdByUser = users.find(user => user?._id.toString() === product?.createdById?.toString());

      const cityName = createdByUser ? cityNameMap.get(createdByUser?.cityId?.toString()) : "Unknown City";
      const stateName = createdByUser ? stateNameMap.get(createdByUser?.stateId?.toString()) : "Unknown State";
      const phone = createdByUser?.phone || "Unknown Phone";
      const isVerified = createdByUser?.isVerified || false;
      const productImg = product?.imageArr?.length > 0 ? product.imageArr[0] : "No Image Available";

      return {
        cityName,
        stateName,
        productImg, // Assuming 'img' is the field for the product image
        productPrice: product?.sellingprice, // Assuming 'sellingprice' is the field for the product price
        isVerified, // User verification status
        phone,
        ...product, // User phone number
      };
    });

    const totalElements = await Product.find(query).countDocuments().exec();

    res.status(200).json({ message: "getProduct", data: populatedProducts, totalElements, success: true });
  } catch (err) {
    next(err);
  }
};


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
// export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let ProductArr: any = [];

//     let query: any = {};

//     if (req.query.userId) {
//       query.createdById = req.query.userId;
//     }

//     if (req.query.searchQuery) {
//       query = { ...query, name: new RegExp(`${req.query.searchQuery}`, "i") };
//     }
//     if (req.query.q) {
//       query = { ...query, name: new RegExp(`${req.query.q}`, "i") };
//     }

//     let pageValue = req.query.page ? parseInt(`${req.query.page}`) : 1;
//     let limitValue = req.query.perPage ? parseInt(`${req.query.perPage}`) : 1000;

//     if (req.query.category) {
//       query = { ...query, "categoryArr.categoryId": req.query.category };
//     }
//     if (req.query.role && req.query.role != null && req.query.role != "null") {
//       query = { ...query, "createdByObj.role": { $ne: req.query.role } };
//     }
//     if (req.query.users) {
//       let usersArr = `${req.query.users}`.split(",");
//       console.log(usersArr, "usersArr")
//       query = { ...query, "createdById": { $in: [...usersArr.map(el => new mongoose.Types.ObjectId(el))] } };
//     }
//     if (req.query.categories) {
//       let categoryArr = `${req.query.categories}`.split(",");
//       query = { ...query, "categoryArr.categoryId": { $in: [...categoryArr] } };
//     }
//     if (req.query.locations) {
//       let locationArr = `${req.query.locations}`.split(",");
//       query = { ...query, "createdByObj.cityId": { $in: [...locationArr] } };
//     }
//     if (req.query.city) {
//       let locationArr = `${req.query.city}`.split(",");
//       query = { ...query, "createdByObj.state": { $in: [...locationArr] } };
//     }
//     if (req.query.rating) {
//       let ratingValue: number = +req.query.rating;
//       query = { ...query, "createdByObj.rating": { $gte: ratingValue } };
//     }
//     if (req.query.vendors) {
//       let vendorArr: any = `${req.query.vendors}`.split(",");
//       query = { ...query, $or: vendorArr.map((el: any) => ({ "brand": el })) };
//     }
//     if (req.query.minPrice) {
//       if (query.sellingprice) {
//         query = { ...query, sellingprice: { ...query.sellingprice, $gte: req.query.minPrice } };
//       } else {
//         query = { ...query, sellingprice: { $gte: req.query.minPrice } };
//       }
//     }
//     if (req.query.maxPrice) {
//       let maxPrice: number = +req.query.maxPrice;
//       if (query.sellingprice) {
//         query = { ...query, sellingprice: { ...query.sellingprice, $lte: maxPrice } };
//       } else {
//         query = { ...query, sellingprice: { $lte: maxPrice } };
//       }
//     }

//     console.log(query);

//     ProductArr = await Product.find(query).skip((pageValue - 1) * limitValue).limit(limitValue).exec();

//     let totalElements = await Product.find(query).count().exec();

//     console.log(totalElements, ProductArr?.length);

//     res.status(200).json({ message: "getProduct", data: ProductArr, totalElements: totalElements, success: true });
//   } catch (err) {
//     next(err);
//   }
// };

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
    const productArr = await Product.find({ categoryId: new mongoose.Types.ObjectId(req.params.id) }).lean().exec();
    if (!productArr) throw new Error("Products not found");

    // Extract userIds and cityIds from the products (assuming the user is linked to each product)
    const userIds = productArr.map(product => product.createdById);

    // Fetch users associated with these products
    const users = await User.find({ _id: { $in: userIds } }).lean().exec();
    const cityIds = users.map(user => user.cityId);

    // Fetch the city names based on cityIds
    const cities = await City.find({ _id: { $in: cityIds } }).lean().exec();

    // Create a mapping of cityId to city name
    const cityMap = new Map(cities.map(city => [city._id.toString(), city.name]));

    // Create a user map to easily get user details
    const userMap = new Map(users.map(user => [user._id.toString(), user]));

    // Map through products and include the desired fields along with city name
    const filteredProducts = productArr.map((product: any) => {
      const user = userMap.get(product.createdById.toString());
      const cityName = user ? cityMap.get(user.cityId.toString()) || 'Unknown City' : 'Unknown City';

      return {

        categoryId: product.categoryId,
        cityName, // City name fetched based on user's cityId
        productName: product.name,
        productId: product._id,

        isVerified: user?.isVerified || false, // Assuming isVerified is a property on the user
        price: product.sellingprice,
        productImage: product.mainImage || 'No image available', // Assuming mainImage field exists
        userMobileNumber: user ? user.phone || 'No mobile number available' : 'No mobile number available' // Assuming mobileNumber field exists
      };
    });

    res.status(200).json({
      message: "Filtered Products with City Names",
      data: filteredProducts,
      success: true
    });
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

// export const searchProductWithQuery: RequestHandler = async (req, res, next) => {
//   try {

//     let query: any = {};
//     if (req.query.role && !req.query.role == null) {
//       query = { ...query, "createdByObj.role": { $ne: req.query.role } };
//     }

//     if (req.query.name) {
//       query = {
//         ...query, $or: [
//           { name: new RegExp(`${req.query.name}`, "i") },
//           { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
//           { "shortDescription": new RegExp(`${req.query.name}`, "i") },
//           { "longDescription": new RegExp(`${req.query.name}`, "i") },

//         ]
//       };
//       // { "brandId": new RegExp(`${req.query.name}`, "i") },
//       let brandArr = await Brand.find({ name: new RegExp(`${req.query.name}`, "i") }).exec()
//       if (brandArr && brandArr.length > 0) {
//         query = {
//           ...query, $or: [
//             { name: new RegExp(`${req.query.name}`, "i") },
//             { "createdByObj.name": new RegExp(`${req.query.name}`, "i") },
//             { "shortDescription": new RegExp(`${req.query.name}`, "i") },
//             { "longDescription": new RegExp(`${req.query.name}`, "i") },
//             { "brand": { $in: [...brandArr.map(el => `${el._id}`)] } },

//           ]
//         }
//       }
//     }

//     console.log(JSON.stringify(query, null, 2), "query")

//     const arr = await Product.find(query).select({ name: 1, _id: 1, slug: 1 })
//       .lean()
//       .exec();
//     res.status(200).json({ message: "Arr", data: arr, success: true });
//   } catch (error) {
//     next(error);
//   }
// };
export const searchProductWithQuery: RequestHandler = async (req, res, next) => {
  try {
    let query: any = {};

    // Role filter
    if (req.query.role && req.query.role !== "null") {
      query = { ...query, "createdByObj.role": { $ne: req.query.role } };
    }

    // Name, creator's name, short description, long description, and brand name filter
    if (req.query.name) {
      const regex = new RegExp(`${req.query.name}`, "i");
      let brandArr = await Brand.find({ name: regex }).exec();
      let brandIds = brandArr.length > 0 ? brandArr.map(el => `${el._id}`) : [];

      query = {
        ...query,
        $or: [
          { name: regex },
          { "createdByObj.name": regex },
          { "shortDescription": regex },
          { "longDescription": regex },
          ...(brandIds.length > 0 ? [{ "brand": { $in: brandIds } }] : [])
        ]
      };
    }

    // Category filter
    if (req.query.categoryId) {
      query = { ...query, "categoryId": req.query.categoryId };
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      const priceQuery: any = {};
      if (req.query.minPrice) priceQuery.$gte = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) priceQuery.$lte = parseFloat(req.query.maxPrice as string);
      query = { ...query, "price": priceQuery };
    }

    // Selling Price filter
    if (req.query.minSellingPrice || req.query.maxSellingPrice) {
      const sellingPriceQuery: any = {};
      if (req.query.minSellingPrice) sellingPriceQuery.$gte = parseFloat(req.query.minSellingPrice as string);
      if (req.query.maxSellingPrice) sellingPriceQuery.$lte = parseFloat(req.query.maxSellingPrice as string);
      query = { ...query, "sellingprice": sellingPriceQuery };
    }

    // Specification filters
    if (req.query.thickness) {
      query = { ...query, "specification.thickness": new RegExp(`${req.query.thickness}`, "i") };
    }
    if (req.query.application) {
      query = { ...query, "specification.application": new RegExp(`${req.query.application}`, "i") };
    }
    if (req.query.grade) {
      query = { ...query, "specification.grade": new RegExp(`${req.query.grade}`, "i") };
    }
    if (req.query.color) {
      query = { ...query, "specification.color": new RegExp(`${req.query.color}`, "i") };
    }
    if (req.query.size) {
      query = { ...query, "specification.size": new RegExp(`${req.query.size}`, "i") };
    }
    if (req.query.wood) {
      query = { ...query, "specification.wood": new RegExp(`${req.query.wood}`, "i") };
    }
    if (req.query.glue) {
      query = { ...query, "specification.glue": new RegExp(`${req.query.glue}`, "i") };
    }
    if (req.query.warranty) {
      query = { ...query, "specification.warranty": new RegExp(`${req.query.warranty}`, "i") };
    }

    // Status filter
    if (req.query.status) {
      query = { ...query, status: req.query.status === "true" };
    }

    // Approval status filter
    if (req.query.approved) {
      query = { ...query, approved: req.query.approved };
    }
    // isVerified filter
    if (req.query.isVerified) {
      query = { ...query, isVerified: req.query.isVerified === "true" };
    }


    // User filters
    if (req.query.userName || req.query.userEmail || req.query.userPhone) {
      const userQuery: any = {};

      if (req.query.userName) {
        userQuery.name = new RegExp(`${req.query.userName}`, "i");
      }
      if (req.query.userEmail) {
        userQuery.email = new RegExp(`${req.query.userEmail}`, "i");
      }
      if (req.query.userPhone) {
        userQuery.phone = new RegExp(`${req.query.userPhone}`, "i");
      }

      const users = await Product.find(userQuery).select('_id').exec();
      const userIds = users.map(user => user._id);
      query = { ...query, createdById: { $in: userIds } };
    }

    console.log(JSON.stringify(query, null, 2), "query");

    const arr = await Product.find(query)
      .populate('createdById', 'name email phone mainImage approved')
      .select({ name: 1, _id: 1, slug: 1, price: 1, sellingprice: 1, brand: 1, mainImage: 1, approved: 1 })
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

export const getProductYouMayLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const defaultCriteria: any = {};

    if (req.query.category) {
      defaultCriteria.categoryId = req.query.category;
    }

    if (req.query.brand) {
      defaultCriteria.brand = req.query.brand;
    }

    const products = await Product.find(defaultCriteria)
      .limit(10)
      .lean()
      .exec();

    const userIds = products.map((product) => product.createdById);
    const productIds = products.map((product) => product._id);

    const [users, productDetails] = await Promise.all([
      User.find({ _id: { $in: userIds } }).lean().exec(),
      Product.find({ _id: { $in: productIds } }).lean().exec(),
    ]);

    // Create maps for cities and states
    const cityMap = new Map();
    const stateMap = new Map();

    users.forEach((user) => {
      cityMap.set(user._id.toString(), user.cityId);
      stateMap.set(user._id.toString(), user.stateId); // Store stateId for each user
    });

    // Fetch city names
    const cityIds = Array.from(new Set(users.map((user) => user.cityId)));
    const cities = await City.find({ _id: { $in: cityIds } }).lean().exec();
    const cityNameMap = new Map(cities.map((city: any) => [city._id.toString(), city.name]));

    // Fetch state names
    const stateIds = Array.from(new Set(users.map((user) => user.stateId)));
    const states = await State.find({ _id: { $in: stateIds } }).lean().exec();
    const stateNameMap = new Map(states.map((state: any) => [state._id.toString(), state.name]));

    const populatedProducts = await Promise.all(
      products.map(async (product: any) => {
        if (product.brand) {
          product.brandObj = await Brand.findById(product.brand).lean().exec();
        }

        // Find the user who created the product
        const createdByObj = users.find((user) => user._id.toString() === product.createdById.toString());

        // Get city and state details
        const cityId = createdByObj?.cityId || null;
        const cityName = cityId ? cityNameMap.get(cityId.toString()) || "Unknown City" : "Unknown City";

        const stateId = createdByObj?.stateId || null;
        const stateName = stateId ? stateNameMap.get(stateId.toString()) || "Unknown State" : "Unknown State";

        const address = createdByObj?.address || "Unknown Address";

        // Fetch product details

        const productDetail = productDetails.find((p) => p._id.toString() === product._id.toString());
        const productName = productDetail ? productDetail.name : "Unknown Product";
        const productPrice = productDetail ? productDetail.price : "N/A";

        const productData = { ...product }; // Clone the product object

        // Remove the token field if it exists
        if (productData.createdByObj && 'token' in productData.createdByObj) {
          delete productData.createdByObj.token;
        }

        return {

          cityName,
          stateName,   // Include stateName in the response
          address,
          // Include address in the response
          productName,
          productPrice,
          createdByObj,
          product
        };
      })
    );

    res.json({ message: 'Suggested Products', data: populatedProducts });
  } catch (error) {
    next(error);
  }
};

