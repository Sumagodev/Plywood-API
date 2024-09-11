const axios = require('axios');


export const  SendBrevoMail = async (subject:string,to:{email:string,name:string}[],htmlContent:any,attachment:any =[]) => {
  try {
    
    let data:any = {
      sender : {
        "name": "Plywood Bazar",
        "email": "admin@plywoodbazar.com"
      },
      to,
      subject,
      htmlContent, 
    };

    if(attachment && attachment?.length > 0){
      data.attachment = attachment
    }

    console.log(data,"datadatadata", "BREVO_API_KEY",process.env.BREVO_API_KEY)
  
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.brevo.com/v3/smtp/email',
      headers: { 
        'accept': 'application/json', 
        'api-key':  `${process.env.BREVO_API_KEY}`, 
        'content-type': 'application/json'
      },
      data : JSON.stringify(data)
    };
  
    let {data:res} = await axios(config);
    console.log(res,"ResposenFrom Brevo")
    if(res.messageId) {
      return true;
    }
  
  } catch (error) {
      console.log("BREVAMAIL => ",error)
      return false;

  }







}
