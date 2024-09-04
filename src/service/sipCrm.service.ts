import axios from "axios";

const USERNAME = "plywood1009877";
const PASSWORD = "14755";

type SpiCrmType = {
  Username?: string;
  Password?: string;
  PersonName?: string;
  CompanyName?: string;
  MobileNo?: string;
  EmailID?: string;
  City?: string;
  State?: string;
  Country?: string;
  CountryCode?: string;
  PinCode?: string;
  ResidentialAddress?: string;
  OfficeAddress?: string;
  SourceName?: string;
  MediumName?: string;
  CampaignName?: string;
  InitialRemarks?: string;
};

const generateSpiCrmToken = async () => {
  try {
    let config = {
      method: "get",
      url: `http://sipapi.kit19.com/Enquiry/TokenGuidOPR?UserName=${USERNAME}&Mode=Get`,
    };

    let { data: res } = await axios.request(config);
    console.log(res, "SPICRMLEAD TOKEN =>");

    if (res?.Status && res?.Status == 1 && res?.Details != "") {
      return res?.Details;
    }
    return "";
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const postSpiCrmLead = async (obj: SpiCrmType) => {
  try {
    let data: SpiCrmType = {
      Username: USERNAME,
      Password: PASSWORD,
      SourceName: "app",
    };

    if (obj.PersonName) {
      data.PersonName = obj.PersonName;
    }

      if (obj.CompanyName) {
       data.PersonName = obj.CompanyName;
     }

    if (obj.SourceName) {
      data.SourceName = obj.SourceName;
    }

    if (obj.CompanyName) {
      data.CompanyName = obj.CompanyName;
    }

    if (obj.MobileNo) {
      data.MobileNo = obj.MobileNo;
      data.CountryCode = "+91";
    }

    if (obj.EmailID) {
      data.EmailID = obj.EmailID;
    }

    if (obj.City) {
      data.City = obj.City;
    }

    if (obj.State) {
      data.State = obj.State;
    }

    if (obj.PinCode) {
      data.PinCode = obj.PinCode;
    }
    if (obj.ResidentialAddress) {
      data.ResidentialAddress = obj.ResidentialAddress;
    }
    if (obj.SourceName) {
      data.SourceName = obj.SourceName;
    }
    if (obj.MediumName) {
      data.MediumName = obj.MediumName;
    }
    if (obj.CampaignName) {
      data.CampaignName = obj.CampaignName;
    }
    if (obj.InitialRemarks) {
      data.InitialRemarks = obj.InitialRemarks;
    }

    console.log(data, "datadatadata");

    let token = await generateSpiCrmToken();
    console.log(token, "SPICRMLEAD token =>");

    if (!token) {
      return false;
    }

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `http://sipapi.kit19.com/Enquiry/${token}/AddEnquiryAPI`,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    let { data: res } = await axios.request(config);

    console.log(res, "SPICRMLEAD =>");
    if (res?.Status && res?.Status == 0 && res?.Message == "Success") {
      return res?.Details;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
