"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const users_route_1 = __importDefault(require("./routes/users.route"));
const category_route_1 = __importDefault(require("./routes/category.route"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const country_routes_1 = __importDefault(require("./routes/country.routes"));
const state_routes_1 = __importDefault(require("./routes/state.routes"));
const city_routes_1 = __importDefault(require("./routes/city.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const leads_routes_1 = __importDefault(require("./routes/leads.routes"));
const flashSale_routes_1 = __importDefault(require("./routes/flashSale.routes"));
const productReviews_routes_1 = __importDefault(require("./routes/productReviews.routes"));
const usersubscription_routes_1 = __importDefault(require("./routes/usersubscription.routes"));
const userRequirement_routes_1 = __importDefault(require("./routes/userRequirement.routes"));
const advertisement_routes_1 = __importDefault(require("./routes/advertisement.routes"));
const userTickets_routes_1 = __importDefault(require("./routes/userTickets.routes"));
const userTicketsMessage_routes_1 = __importDefault(require("./routes/userTicketsMessage.routes"));
const blogs_routes_1 = __importDefault(require("./routes/blogs.routes"));
const blogsVideos_routes_1 = __importDefault(require("./routes/blogsVideos.routes"));
const topup_routes_1 = __importDefault(require("./routes/topup.routes"));
const usertopup_routes_1 = __importDefault(require("./routes/usertopup.routes"));
const newsletter_routes_1 = __importDefault(require("./routes/newsletter.routes"));
const websiteData_routes_1 = __importDefault(require("./routes/websiteData.routes"));
const seo_routes_1 = __importDefault(require("./routes/seo.routes"));
const homepageBanner_routes_1 = __importDefault(require("./routes/homepageBanner.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./helpers/config");
const seeder_1 = require("./seeder/seeder");
const cors_1 = __importDefault(require("cors"));
const errorHandler_middleware_1 = require("./middlewares/errorHandler.middleware");
mongoose_1.default.connect(config_1.CONFIG.MONGOURI, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    (0, seeder_1.seedData)();
    console.log("connected to db at " + config_1.CONFIG.MONGOURI);
});
mongoose_1.default.set("debug", true);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json({ limit: "500mb" }));
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.set("view engine", "ejs"); /// set template engine //
app.use(auth_middleware_1.setUserAndUserObj);
app.use("/", index_route_1.default);
app.use("/users", users_route_1.default);
app.use("/category", category_route_1.default);
app.use("/brand", brand_routes_1.default);
app.use("/blog", blogs_routes_1.default);
app.use("/blogVideo", blogsVideos_routes_1.default);
app.use("/product", product_route_1.default);
app.use("/country", country_routes_1.default);
app.use("/state", state_routes_1.default);
app.use("/city", city_routes_1.default);
app.use("/subscription", subscription_routes_1.default);
app.use("/advertisement", advertisement_routes_1.default);
app.use("/usersubscription", usersubscription_routes_1.default);
app.use("/leads", leads_routes_1.default);
app.use("/flashSales", flashSale_routes_1.default);
app.use("/productReview", productReviews_routes_1.default);
app.use("/userRequirement", userRequirement_routes_1.default);
app.use("/userTicket", userTickets_routes_1.default);
app.use("/userTicketMessage", userTicketsMessage_routes_1.default);
app.use("/topup", topup_routes_1.default);
app.use("/userTopup", usertopup_routes_1.default);
app.use("/newsLetter", newsletter_routes_1.default);
app.use("/websiteData", websiteData_routes_1.default);
app.use("/seo", seo_routes_1.default);
app.use("/homepageBanners", homepageBanner_routes_1.default);
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;
