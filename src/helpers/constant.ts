import { Subscription } from "../models/Subscription.model";
export const ROLES = {
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

export const APPROVED_STATUS = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
};
export const SUBSCRIPTION_TYPE = {
  REGULAR: "REGULAR",
  PREMIUM: "PREMIUM",
};

export const notification_text = {
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

export const getSubscriptionSequence = (orderID: number) => {
  return `${SubscriptionInvoice}` + String(orderID).padStart(3, "0");
};

export const getTopUpOrderIdSequence = (orderID: number) => {
  return `${TopupInvoice}` + String(orderID).padStart(3, "0");
};
