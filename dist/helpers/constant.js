"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopUpOrderIdSequence = exports.getSubscriptionSequence = exports.notification_text = exports.SUBSCRIPTION_TYPE = exports.APPROVED_STATUS = exports.ROLES = void 0;
exports.ROLES = {
    ADMIN: "ADMIN",
    SUBADMIN: "SUBADMIN",
    USER: "USER",
    MANUFACTURER: "MANUFACTURER/IMPORTER",
    DISTRIBUTOR: "DISTRIBUTOR",
    DEALER: "DEALER",
    APPROVERS: "APPROVERS",
    FIELDUSER: "FIELDUSER",
    SALES: "SALES",
};
exports.APPROVED_STATUS = {
    APPROVED: "APPROVED",
    PENDING: "PENDING",
    REJECTED: "REJECTED",
};
exports.SUBSCRIPTION_TYPE = {
    REGULAR: "REGULAR",
    PREMIUM: "PREMIUM",
};
exports.notification_text = {
    lead_notification_text_obj: {
        title: "Lead Created 📈",
        content: "A new lead has just been added to your pipeline.",
    },
    subscription_text_obj: {
        title: "Subscription",
        content: "Your subscription is going to expire in a few days.",
    },
    review_text_obj: {
        title: "Review",
        content: "Review Added Successfully",
    },
};
let SubscriptionInvoice = "PLYBZR";
let TopupInvoice = "PLYBZRTOP";
const getSubscriptionSequence = (orderID) => {
    return `${SubscriptionInvoice}` + String(orderID).padStart(3, "0");
};
exports.getSubscriptionSequence = getSubscriptionSequence;
const getTopUpOrderIdSequence = (orderID) => {
    return `${TopupInvoice}` + String(orderID).padStart(3, "0");
};
exports.getTopUpOrderIdSequence = getTopUpOrderIdSequence;
