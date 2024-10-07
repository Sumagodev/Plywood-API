import axios from "axios";

export const SendSms = async (mobile: string, otp: string) => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=L59wCvpzuEWiiRDYDNFxWQ&senderid=PLYBZR&channel=2&DCS=0&flashsms=0&number=91${mobile}&text=Your OTP for Registration/Login for PlywoodBazar is ${otp}&route=31&EntityId=1701168577184897884&dlttemplateid=1707171256091880039`,
      headers: {},
    };

    let { data: res } = await axios(config);

    console.log(res, "=> SMS RESPONSE");
    if (res["ErrorCode"] == "000" && res["ErrorMessage"] == "Success") {
      return true;
    }

    return false;
  } catch (error) {
    console.log("SMS ERROR");
    return false;
  }
};
export const SendVerificationSMS = async (mobile: string, otp: string) => {
  try {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=L59wCvpzuEWiiRDYDNFxWQ&senderid=PLYBZR&channel=2&DCS=0&flashsms=0&number=91${mobile}&text=${otp} is your phone number verification code for "Plywood Bazar.com".&route=31&EntityId=1701168577184897884&dlttemplateid=1707172526863185585`,
      headers: {},
    };

    let { data: res } = await axios(config);

    console.log(res, "=> SMS RESPONSE");
    if (res["ErrorCode"] == "000" && res["ErrorMessage"] == "Success") {
      return true;
    }

    return false;
  } catch (error) {
    console.log("SMS ERROR");
    return false;
  }
};
