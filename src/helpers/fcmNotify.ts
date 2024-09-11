
import admin, { ServiceAccount } from "firebase-admin";
import serviceAccount from './plywoodbazar-86c65-firebase-adminsdk-tvcb6-43ef393b0d.json';
// var serviceAccount = require('./plywoodbazar-86c65-firebase-adminsdk-tvcb6-43ef393b0d.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const fcmMulticastNotify = async (notificationObj: any) => {
    //notificationData is an object with 2 parameters title and content
    console.log(notificationObj, "NOTIFICATION OBJ")
    if (notificationObj) {
        if (notificationObj.tokens.length) {
            notificationObj.android = { priority: "high" }
            const val = await admin.messaging().sendEachForMulticast(notificationObj);
            console.log(val, "val2");
            return val;
        }
    }
    return 0;
};


