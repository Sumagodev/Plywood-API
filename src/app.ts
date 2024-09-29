import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index.route";
import usersRouter from "./routes/users.route";
import categoryRouter from "./routes/category.route";
import brandRouter from "./routes/brand.routes";
import productRouter from "./routes/product.route";
import countryRouter from "./routes/country.routes";
import stateRouter from "./routes/state.routes";
import cityRouter from "./routes/city.routes";
import subscriptionRouter from "./routes/subscription.routes";
import leadRouter from "./routes/leads.routes";
import flashSaleRouter from "./routes/flashSale.routes";
import productReviewRouter from "./routes/productReviews.routes";
import userSubscriptionRouter from "./routes/usersubscription.routes";
import userRequirementRouter from "./routes/userRequirement.routes";
import advertisementRouter from "./routes/advertisement.routes";
import userTicketRouter from "./routes/userTickets.routes";
import userTicketMessageRouter from "./routes/userTicketsMessage.routes";
import blogRouter from "./routes/blogs.routes";
import blogVideoRouter from "./routes/blogsVideos.routes";
import topupRouter from "./routes/topup.routes";
import usertopupRouter from "./routes/usertopup.routes";
import newsLetterRouter from "./routes/newsletter.routes";
import websiteDataRouter from "./routes/websiteData.routes";
import seoRouter from "./routes/seo.routes";
import homepageBannerRouter from "./routes/homepageBanner.routes";
import { setUserAndUserObj } from "./middlewares/auth.middleware";
import mongoose from "mongoose";
import { CONFIG } from "./helpers/config";
import { seedData } from "./seeder/seeder";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware";

mongoose.connect(CONFIG.MONGOURI, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  seedData();
  console.log("connected to db at " + CONFIG.MONGOURI);
});
mongoose.set("debug", true);

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "ejs"); /// set template engine //

app.use(setUserAndUserObj);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/category", categoryRouter);
app.use("/brand", brandRouter);
app.use("/blog", blogRouter);
app.use("/blogVideo", blogVideoRouter);
app.use("/product", productRouter);
app.use("/country", countryRouter);
app.use("/state", stateRouter);
app.use("/city", cityRouter);
app.use("/subscription", subscriptionRouter);
app.use("/advertisement", advertisementRouter);
app.use("/usersubscription", userSubscriptionRouter);
app.use("/leads", leadRouter);
app.use("/flashSales", flashSaleRouter);
app.use("/productReview", productReviewRouter);
app.use("/userRequirement", userRequirementRouter);
app.use("/userTicket", userTicketRouter);
app.use("/userTicketMessage", userTicketMessageRouter);
app.use("/topup", topupRouter);
app.use("/userTopup", usertopupRouter);
app.use("/newsLetter", newsLetterRouter);
app.use("/websiteData", websiteDataRouter);
app.use("/seo", seoRouter);
app.use("/homepageBanners", homepageBannerRouter);

app.use(errorHandler);

export default app;
