"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnOnvoice = exports.getGST = exports.getIncludesiveGST = exports.generatePdf = exports.returnHtmlOrder = exports.registerTemplate = exports.emailTemplate = exports.sendMail = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Payment_model_1 = require("../models/Payment.model");
const brevoMail_service_1 = require("../service/brevoMail.service");
const puppeteer_1 = __importDefault(require("puppeteer"));
const sendMail = (emailArr, orderId, title, orderObj = {}) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(orderObj, "order response object data ki id se");
        if (orderObj && (orderObj === null || orderObj === void 0 ? void 0 : orderObj.userId)) {
            let orderData = yield Payment_model_1.Payment.findById(`${orderId}`);
            if (orderData) {
                orderObj = orderData.orderObj;
            }
            let OrderHrml = yield (0, exports.emailTemplate)(orderObj);
            let invouiceHtml = yield (0, exports.returnOnvoice)(orderObj);
            let PdfUrl = yield (0, exports.generatePdf)(invouiceHtml, orderId);
            let temp = yield (0, brevoMail_service_1.SendBrevoMail)(title, emailArr, OrderHrml, [{ url: PdfUrl, name: `${orderId}.pdf` }]);
            // let temp = await SendBrevoMail(title, emailArr, emailTemplate(orderObj));
            console.log("==========================temp===temp-----");
        }
        if (orderObj && (orderObj === null || orderObj === void 0 ? void 0 : orderObj.email)) {
            let temp = yield (0, brevoMail_service_1.SendBrevoMail)(title, emailArr, (0, exports.registerTemplate)());
        }
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
exports.sendMail = sendMail;
const emailTemplate = (orderData) => {
    let title = `Congratulations! You Subscribed`;
    let orderDispatchId = "";
    let text = `<!doctype html>
    <html lang="en">     
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Dancing+Script:400,700|Roboto:300,400,500,700,900&display=swap" rel="stylesheet">
            <title>Emailer</title>
    
            <style type="text/css">
            
            @media screen and (max-width: 799px){
            .tablbx {
                padding: 15px !important;
            }
              
            }
            
                    @media screen and (max-width: 609px){
            .mob {
              display:none;
            }
             .sz{
                    
                    font-size: 11px !important;
                }
                
                .de{
                    width: 55px !important;
                }
                    }
            
                html,body 
                {
                    font-family: 'Roboto';
                    font-weight: normal;
                    font-style: normal;
                }
                a.btn-main{padding:0px;width: 200px;background: #108bd0;font-size: 16px;font-weight: 400;color: #fff;border-radius: 3px;text-align: center;line-height:45px;text-decoration: none;margin: 0 auto 0px;border-bottom: 5px solid rgba(0,0,0,0.06);display: table;}
    
                /* ** Media Query ** */
                @media screen and (max-width:799px) 
                {
                    body
                        {
                            margin:0 !important;
                        }
                    .main-block
                        {
                            margin: 0;
                        }
                    .email-container 
                        {
                            width: 100% !important;
                            margin:0 0 0 !important;	
                        }	
                    .stack-column-center 
                        {
                            display: block !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            direction: ltr !important;
                        }
                    li
                        {
                            margin-right: 5px !important;
                            font-size: 12px;
                        }
                    table
                        {
                            width:100% !important;
                            height:auto !important;	
                            padding: 0 10px;
                        }
                    table div
                        {
                            width:auto !important;
                            height:auto !important;	
                        }
                    p
                        {
                            padding: 0 10px;
                        }
                    .center-on-narrow
                        {
                            border: none !important;
                            border-bottom:2px solid #40271a !important;
                            margin-bottom: 10px!important;
                        }
                    .center-on-narrow p
                        {
                            padding: 15px!important;
                            height: auto !important;
                            margin: 0 !important;
                        }
                    table tbody tr td
                        {
                            width: 100%!important;
                            max-width: 100%;
                            display: block;
                            padding: 10px 0!important;
                            text-align: left !important;
                        }
                    table tbody tr td img
                        {
                            height: auto!important;
                        }
                    img.logo-wrap
                        {
                            margin: 15px auto !important;
                            width:150px;
                        }
                    h1
                        {
                            font-size: 18px !important;
                            line-height: 24px !important;
                            margin: 0 15px 15px !important;
                        }
                    .tablbx
                        {
                            padding: 15px !important;
                        }
                    ul
                        {
                            padding: 0 15px !important;
                        }
                    ul li
                        {
                            font-size: 18px !important; margin: 0 0 10px !important;
                        }
                    iframe
                        {
                            margin: 0 0 15px !important;
                        }
                    p.foot-link
                        {
                            text-align: center !important; margin: 15px !important;font-size: 18px !important;
                        }
                    a.btn-main
                        {
                            margin:20px auto 20px !important;display: table !important;width: 90% !important;
                        }
                    .tab-main
                        {
                            margin: 0 0 15px;border: none !important; padding: 0px !important;
                        }
                }
                /* ** End Media Query ** */
            </style>
        </head>
        <body width="100%" bgcolor="#f0f0f0" style="margin: 20px 0;">
            <div class="main-block" style=" background: #f0f0f0;">
                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: auto; background: #fff; padding: 0px; border-radius: 15px; overflow: hidden; width: 800px;" class="email-container">
                    <tbody>
                        <tr>
                            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:15px;background: #ddc99b">
                                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td class="stack-column-center">
                                            <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td dir="ltr" valign="top" style="padding: 0px;">
                                                        <a href="#" target="_blank">
                                                            <img src="https://plywoodbazar.com/static/media/logo.a87540b9afeafbb8d1c9.png" alt="" width="150" 
                                                            height="75" alt="" border="0" class="logo-wrap" style="height: auto;display:block; margin:0 auto;">
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
                                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                                            
                                            <p style="font-size: 16px;font-weight: normal;color: #111;text-align: center;line-height: 24px;margin: 0 0 25px;">
                                            ${title}</p>

                                            <h4>Subscription:${orderData === null || orderData === void 0 ? void 0 : orderData.name}</h4>
                                            <h4>Description:${orderData === null || orderData === void 0 ? void 0 : orderData.description}</h4>
                                            <h4>Price:${orderData === null || orderData === void 0 ? void 0 : orderData.price}</h4>
                                            <h4>Number Of Sales:${orderData === null || orderData === void 0 ? void 0 : orderData.numberOfSales}</h4>
                                            <h4>StartDate:${new Date(orderData === null || orderData === void 0 ? void 0 : orderData.startDate).toDateString()}</h4>
    

                                            <p style="font-size: 16px;font-weight: normal;color: #111;text-align: center;line-height: 24px;margin: 0 0 25px;">
                                            You'll receive an email when your items status update . If you have any queries, <br> Call us at +9403574184</p>
                                        
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
    
                        <tr>
                            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
                                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td class="stack-column-center" style="padding:0;">
                                            <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td dir="ltr" valign="top" style="padding: 30px 30px 30px; background:#ddc99b;">
                                                        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td class="stack-column-center">
                                                                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style=" margin: 0 0 ;">
                                                                        <tr>
                                                                            <td width="40%"></td>
                                                                            <td width="100%" dir="ltr" valign="top" style="padding: 0;">
                                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="padding:0 15px; margin: 0 0px;">
                                                                                    <tr>
                                                                                        <td style="padding: 0 0 ;">
                                                                                    
                                                                                            <p style="font-size: 16px; text-align:center ! important; font-weight: normal;color: #ffffff;line-height: 24px;margin: 0 0 10px;">Copyright  2023 Plywood Bazar</p>
    
                                                                                        
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
    
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr> 
                    </tbody>
                </table>
            </div>
        </body>
    </html>`;
    return text;
};
exports.emailTemplate = emailTemplate;
const registerTemplate = () => {
    let title = `Thank you for registering`;
    let orderDispatchId = "";
    let text = `<!doctype html>
    <html lang="en">     
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Dancing+Script:400,700|Roboto:300,400,500,700,900&display=swap" rel="stylesheet">
            <title>Emailer</title>
    
            <style type="text/css">
            
            @media screen and (max-width: 799px){
            .tablbx {
                padding: 15px !important;
            }
              
            }
            
                    @media screen and (max-width: 609px){
            .mob {
              display:none;
            }
             .sz{
                    
                    font-size: 11px !important;
                }
                
                .de{
                    width: 55px !important;
                }
                    }
            
                html,body 
                {
                    font-family: 'Roboto';
                    font-weight: normal;
                    font-style: normal;
                }
                a.btn-main{padding:0px;width: 200px;background: #108bd0;font-size: 16px;font-weight: 400;color: #fff;border-radius: 3px;text-align: center;line-height:45px;text-decoration: none;margin: 0 auto 0px;border-bottom: 5px solid rgba(0,0,0,0.06);display: table;}
    
                /* ** Media Query ** */
                @media screen and (max-width:799px) 
                {
                    body
                        {
                            margin:0 !important;
                        }
                    .main-block
                        {
                            margin: 0;
                        }
                    .email-container 
                        {
                            width: 100% !important;
                            margin:0 0 0 !important;	
                        }	
                    .stack-column-center 
                        {
                            display: block !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            direction: ltr !important;
                        }
                    li
                        {
                            margin-right: 5px !important;
                            font-size: 12px;
                        }
                    table
                        {
                            width:100% !important;
                            height:auto !important;	
                            padding: 0 10px;
                        }
                    table div
                        {
                            width:auto !important;
                            height:auto !important;	
                        }
                    p
                        {
                            padding: 0 10px;
                        }
                    .center-on-narrow
                        {
                            border: none !important;
                            border-bottom:2px solid #40271a !important;
                            margin-bottom: 10px!important;
                        }
                    .center-on-narrow p
                        {
                            padding: 15px!important;
                            height: auto !important;
                            margin: 0 !important;
                        }
                    table tbody tr td
                        {
                            width: 100%!important;
                            max-width: 100%;
                            display: block;
                            padding: 10px 0!important;
                            text-align: left !important;
                        }
                    table tbody tr td img
                        {
                            height: auto!important;
                        }
                    img.logo-wrap
                        {
                            margin: 15px auto !important;
                            width:150px;
                        }
                    h1
                        {
                            font-size: 18px !important;
                            line-height: 24px !important;
                            margin: 0 15px 15px !important;
                        }
                    .tablbx
                        {
                            padding: 15px !important;
                        }
                    ul
                        {
                            padding: 0 15px !important;
                        }
                    ul li
                        {
                            font-size: 18px !important; margin: 0 0 10px !important;
                        }
                    iframe
                        {
                            margin: 0 0 15px !important;
                        }
                    p.foot-link
                        {
                            text-align: center !important; margin: 15px !important;font-size: 18px !important;
                        }
                    a.btn-main
                        {
                            margin:20px auto 20px !important;display: table !important;width: 90% !important;
                        }
                    .tab-main
                        {
                            margin: 0 0 15px;border: none !important; padding: 0px !important;
                        }
                }
                /* ** End Media Query ** */
            </style>
        </head>
        <body width="100%" bgcolor="#f0f0f0" style="margin: 20px 0;">
            <div class="main-block" style=" background: #f0f0f0;">
                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin: auto; background: #fff; padding: 0px; border-radius: 15px; overflow: hidden; width: 800px;" class="email-container">
                    <tbody>
                        <tr>
                            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:15px;background: #ddc99b">
                                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td class="stack-column-center">
                                            <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td dir="ltr" valign="top" style="padding: 0px;">
                                                        <a href="#" target="_blank">
                                                            <img src="https://plywoodbazar.com/static/media/logo.a87540b9afeafbb8d1c9.png" alt="" width="150" 
                                                            height="75" alt="" border="0" class="logo-wrap" style="height: auto;display:block; margin:0 auto;">
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
                                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                                            
                                            <p style="font-size: 16px;font-weight: normal;color: #111;text-align: center;line-height: 24px;margin: 0 0 25px;">
                                            ${title}</p>
                                            <p style="font-size: 16px;font-weight: normal;color: #111;text-align: center;line-height: 24px;margin: 0 0 25px;">
                                            You'll receive an email when your items status update . If you have any queries, <br> Call us at +9403574184</p>
                                        
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
    
                        <tr>
                            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
                                <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td class="stack-column-center" style="padding:0;">
                                            <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td dir="ltr" valign="top" style="padding: 30px 30px 30px; background:#ddc99b;">
                                                        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td class="stack-column-center">
                                                                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style=" margin: 0 0 ;">
                                                                        <tr>
                                                                            <td width="40%"></td>
                                                                            <td width="100%" dir="ltr" valign="top" style="padding: 0;">
                                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="padding:0 15px; margin: 0 0px;">
                                                                                    <tr>
                                                                                        <td style="padding: 0 0 ;">
                                                                                    
                                                                                            <p style="font-size: 16px; text-align:center ! important; font-weight: normal;color: #ffffff;line-height: 24px;margin: 0 0 10px;">Copyright  2023 Plywood Bazar</p>
    
                                                                                        
                                                                                        </td>
                                                                                    </tr>
                                                                                </table>
                                                                            </td>
    
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr> 
                    </tbody>
                </table>
            </div>
        </body>
    </html>`;
    return text;
};
exports.registerTemplate = registerTemplate;
const returnHtmlOrder = (orderData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    console.log(orderData, "obbbbbbjjjjjjjjeeeecccttttttt");
    console.log(orderData.productsArr, "product array");
    let text = `<!doctype html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Dancing+Script:400,700|Roboto:300,400,500,700,900&display=swap"
      rel="stylesheet">
    <title>Emailer</title>
  
    <style type="text/css">
      html,
      body {
        font-family: 'Roboto';
        font-weight: normal;
        font-style: normal;
      }
  
      a.btn-main {
        padding: 0px;
        width: 200px;
        background: #108bd0;
        font-size: 16px;
        font-weight: 400;
        color: #fff;
        border-radius: 3px;
        text-align: center;
        line-height: 45px;
        text-decoration: none;
        margin: 0 auto 0px;
        border-bottom: 5px solid rgba(0, 0, 0, 0.06);
        display: table;
      }
  
      /* ** Media Query ** */
  
      /* ** End Media Query ** */
    </style>
  </head>
  
  <body width="100%" bgcolor="#f0f0f0" style="margin: 20px 0;">
    <div class="main-block" style=" background: #f0f0f0;">
      <table role="presentation" cellspacing="0" cellpadding="0" align="center"
        style="margin: auto; background: #fff; padding: 0px; border-radius: 15px; overflow: hidden; width: 800px;"
        class="email-container">
        <tbody>
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%"
              style="padding:15px;background: #ddc99b">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <tr>
                        <td dir="ltr" valign="top" style="padding: 0px;">
                          <a href="#" target="_blank">
                            <img src="https://apitouch.ebslonserver3.com/uploads/logo.webp"
                              alt="" width="150" height="75" alt="" border="0"
                              class="logo-wrap"
                              style="height: auto;display:block; margin:0 auto;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                    <h1
                      style="font-size: 28px;font-weight: 500;color: #111;text-align: center;margin: 0 0 15px;">
                      Thanks for your order</h1>
                    <p
                      style="font-size: 16px;font-weight: normal;color: #111;text-align: center;line-height: 24px;margin: 0 0 25px;">
                      You'll receive an email when your items are shipped. If you have any queries,
                      <br> Call us at +91 7041746797
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0 15px;">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <tr>
                        <td dir="ltr" valign="top" style="padding: 15px; background: #fff;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%" style=" margin: 0 0 ;">
                            <tr>
                              <td width="50%" dir="ltr" valign="top" class="tab-main"
                                style="padding:25px; background:#f4f4f4f4; border: 2px solid #f4f4f4f4; border-radius: 5px 0 0 5px;">
                                <table role="presentation" cellspacing="0" cellpadding="0"
                                  border="0" style="padding:0 ;width: 100%;">
                                  <tr>
                                    <td style="padding: 0 0;width: 100%;"
                                      class="tablbx">
                                      <h3
                                        style="font-size: 22px;font-weight: 600;color: #111;margin: 0 0 15px; text-transform: uppercase;">
                                        Summary :</h3>
                                      <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                                        width="100%"
                                        style=" margin: 0 0 ; width: 100%;display: block;">
                                      
  
                                        <tr>
                                        <th width="100%" dir="ltr" valign="top"
                                        style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            Silvista India Private Limited
      
                                              <br>
                                               +91 7041746797
                                                <br>
                                                info@touch925.com 
                                                    <br>Silvista India Private   Limited 828,Sun Gravitas, Radio Mirchi  Road,Vejalpur  Ahmedabad
                                                    380051,Gujarat India	
                                          </p>
                                        </th>
                                      </tr>
                                      <tr>
                                      <th width="50%" dir="ltr" valign="top"
                                        style="
                                        text-align: left;
                                        font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                        <b>Order Id</b> : &nbsp;&nbsp;
                                      </th>

                                      <th width="50%" dir="ltr" valign="top"
                                        style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                        ${orderData === null || orderData === void 0 ? void 0 : orderData.orderId}
                                      </th>
                                    </tr>

                                    <tr>
                                      <th width="50%" dir="ltr" valign="top"
                                        style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                        <b>Order Date</b>: &nbsp;&nbsp;
                                      </th>
                                      <th width="50%" dir="ltr" valign="top"
                                        style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                        ${new Date(orderData === null || orderData === void 0 ? void 0 : orderData.createdAt).toDateString()}
                                      </th>

                                    </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
  
                              <td width="50%" dir="ltr" valign="top" class="tab-main"
                                style="padding:25px; background: #f4f4f4f4; border: 2px solid #f4f4f4f4; border-left: none; border-radius: 0 5px 5px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0"
                                  border="0" style="padding:0; margin: 0px;width: 100%;">
                                  <tr>
                                    <td style="padding: 0 0 ;width: 100%;"
                                      class="tablbx">
                                      <h3
                                        style="font-size: 22px;font-weight: 600;color: #111;margin: 0 0 15px; text-transform: uppercase;">
                                        Shipping Address :</h3>
                                      <p
                                        style="font-size: 16px;font-weight: normal;color: #111;    padding: 8px 27px 1px 2px; line-height: 24px;">
                                        <b>Name</b>: ${(_a = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _a === void 0 ? void 0 : _a.firstName}
  
                                          <br>
                                          <b>Phone</b> : ${(_b = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _b === void 0 ? void 0 : _b.phone} 
  
                                            <br>
                                            <b>Email</b> : ${(_c = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _c === void 0 ? void 0 : _c.email} 
                                            
                                              <br>
                                              <b>Pincode</b> : ${(_d = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _d === void 0 ? void 0 : _d.pincode}
                                                 
  
                                                <br><b>Address</b>: ${(_e = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _e === void 0 ? void 0 : _e.street}
                                                  
                                                  &nbsp;, ${(_f = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _f === void 0 ? void 0 : _f.city}
                                                     
                                                    &nbsp;, ${(_g = orderData === null || orderData === void 0 ? void 0 : orderData.addressObj) === null || _g === void 0 ? void 0 : _g.state}		
                                                  <br>
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0 15px;">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <tr>
                        <td dir="ltr" valign="top" style="padding: 15px; background: #fff;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%" style=" margin: 0 0 ;">
                            <tr>
                              <th width="30%" dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal;color: #111;text-transform: uppercase;margin: 0;">
                                  Product Image</h6>
                              </th>
  
                              <th width="50%" dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal;color: #111;text-transform: uppercase;margin: 0;">
                                  Name</h6>
                              </th>
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal;color: #111;text-transform: uppercase;margin: 0;">
                                  Quantity</h6>
                              </th>
  
  
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal;color: #111;text-transform: uppercase;margin: 0;">
                                  Price</h6>
                              </th>
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal;color: #111;text-transform: uppercase;margin: 0;">
                                  Subtotal</h6>
                              </th>
                            </tr>
  
                            ${orderData.productsArr.reduce((acc, el, i) => acc +
        `
                            <tr>
                                <td width="30%" dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
  
                                  <img src="https://apitouch.ebslonserver3.com/uploads/${orderData === null || orderData === void 0 ? void 0 : orderData.productsArr[i].image}"
                                    height="100px" width="100px" alt="product image">
  
                                </td>
                                <td width="50%" dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ${orderData === null || orderData === void 0 ? void 0 : orderData.productsArr[i].name}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ${orderData === null || orderData === void 0 ? void 0 : orderData.productsArr[i].quantity}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
  
                                    ${orderData === null || orderData === void 0 ? void 0 : orderData.productsArr[i].price}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ${Math.round((orderData === null || orderData === void 0 ? void 0 : orderData.productsArr[i].price) * (orderData === null || orderData === void 0 ? void 0 : orderData.productsArr[i].quantity))}
                                  </h6>
                                </td>
                              </tr>
                            `, "")}
                              
                          </table>
                      <tr>
                        <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%"
                          style="padding:0 15px;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%">
                            <tr>
                              <td class="stack-column-center">
                                <table role="presentation" align="center" border="0"
                                  cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td width="50%" dir="ltr" valign="top"
                                      style="padding: 15px; background: #fff;"></td>
                                    <td dir="ltr" valign="top"
                                      style="padding: 15px; background: #fff;">
                                      <table role="presentation" align="center"
                                        border="0" cellpadding="0" cellspacing="0"
                                        width="100%" style=" margin: 0 0 ;">
                                        <tr>
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;color: #111;">
                                            Subtotal :
                                          </th>
  
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;color: #111; text-align: right;">
                                            ${orderData === null || orderData === void 0 ? void 0 : orderData.subTotalAmount}
                                          </th>
                                        </tr>
                                        ${(orderData === null || orderData === void 0 ? void 0 : orderData.dicountObj) && ((_h = orderData === null || orderData === void 0 ? void 0 : orderData.dicountObj) === null || _h === void 0 ? void 0 : _h.code)
        ? `    <tr>
                                              <th width="50%;"
                                              style="padding: 5px;font-size: 16px;font-weight: 500;color: #111;">
                                                Discount (${(_j = orderData === null || orderData === void 0 ? void 0 : orderData.dicountObj) === null || _j === void 0 ? void 0 : _j.code}) 
                                              </th>
      
                                              <th width="50%;"
                                                style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                                - ₹ ${(_k = orderData === null || orderData === void 0 ? void 0 : orderData.dicountObj) === null || _k === void 0 ? void 0 : _k.amount}
                                              </th>
                                            </tr>`
        : ""}
                            
                                    
                                        <tr>
                                        <th width="50%;"
                                          style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                          <strong
                                            style="color: #111">Shipping Charges</strong>
                                        </th>

                                        <th width="50%;"
                                          style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                            Free
                                        </th>
                                      </tr>

                                        ${(orderData === null || orderData === void 0 ? void 0 : orderData.giftwarp) == true
        ? `      <tr>
                                              <th width="50%;"
                                                style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                                <strong
                                                  style="color: #111">Gift Wrap</strong>
                                              </th>
      
                                              <th width="50%;"
                                                style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                                  -99
                                              </th>
                                            </tr>`
        : ""}



                                      
                                        <tr>
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                            <strong
                                              style="font-weight: bold;color: #111">Order
                                              Total :</strong>
                                          </th>
  
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                            ${orderData === null || orderData === void 0 ? void 0 : orderData.totalAmount}
                                          </th>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
  
                      <tr>
                        <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%"
                          style="padding:0px;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%">
                            <tr>
                              <td class="stack-column-center" style="padding:0;">
                                <table role="presentation" align="center" border="0"
                                  cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td dir="ltr" valign="top"
                                      style="padding: 30px 30px 30px; background:#ddc99b;">
                                      <table role="presentation" align="center"
                                        border="0" cellpadding="0" cellspacing="0"
                                        width="100%">
                                        <tr>
                                          <td class="stack-column-center">
                                            <table role="presentation"
                                              align="center" border="0"
                                              cellpadding="0" cellspacing="0"
                                              width="100%"
                                              style=" margin: 0 0 ;">
                                              <tr>
                                                <td width="35%"></td>
                                                <td width="100%" dir="ltr"
                                                  valign="top"
                                                  style="padding: 0;">
                                                  <table
                                                    role="presentation"
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    border="0"
                                                    style="padding:0 15px; margin: 0 0px;">
                                                    <tr>
                                                      <td
                                                        style="padding: 0 0 ;">
  
                                                        <p
                                                          style="font-size: 16px; text-align:center ! important; font-weight: normal;color: #ffffff;line-height: 24px;margin: 0 0 10px;">
                                                          Copyright
                                                          2023 . Touch925
                                                        </p>
                                                      </td>
                                                    </tr>
                                                  </table>
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </body>
            </html>`;
    return text;
};
exports.returnHtmlOrder = returnHtmlOrder;
const generatePdf = (html, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        // Create a new page
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: "networkidle0" });
        // To reflect CSS used for screens instead of print
        yield page.emulateMediaType("screen");
        // Downlaod the PDF
        let pdf = yield page.pdf({
            path: `public/invoice/${orderId}.pdf`,
            format: "A4",
        });
        let invoiceUrl = `invoice/${orderId}.pdf`;
        // let invoiceUrl = `${LOCALURL.LIVEURL}/invoice/${orderData._id}.pdf`;
        console.log(invoiceUrl, "invoiceUrl invoiceUrl");
        fs_1.default.writeFile(path_1.default.join(__dirname, "../../public/invoice/", `${orderId}.pdf`), pdf, {}, (err) => {
            if (err) {
                console.error(err);
                return "";
            }
            console.log("video saved");
        });
        invoiceUrl = `${process.env.BASE_URL}/invoice/${orderId}.pdf`;
        // fs.writeFile(path.join(L+'/public/invoice/', `${pdfNmae}.pdf`), pdf, {}, (err:any) => {
        //   if (err) {
        //     console.error(err)
        //     return " "
        //   }
        //   console.log('video saved')
        // })
        yield browser.close();
        return invoiceUrl;
        // res.status(200).json({ message: "success", data: invoiceUrl, success: true });
        // Close the browser instance
    }
    catch (error) {
        console.error(error);
        return "";
    }
});
exports.generatePdf = generatePdf;
const getIncludesiveGST = (amount, rate) => {
    return (amount - amount / (1 + rate / 100)).toFixed(2);
};
exports.getIncludesiveGST = getIncludesiveGST;
const getGST = (amount, rate) => {
    return ((amount * rate) / 100).toFixed(2);
};
exports.getGST = getGST;
const returnOnvoice = (orderData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
    let text = `<!doctype html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Dancing+Script:400,700|Roboto:300,400,500,700,900&display=swap"
      rel="stylesheet">
    <title>Emailer</title>
  
    <style type="text/css">
      html,
      body {
        font-family: 'Roboto';
        font-weight: normal;
        font-style: normal;
      }
  
      a.btn-main {
        padding: 0px;
        width: 200px;
        background: #108bd0;
        font-size: 16px;
        font-weight: 400;
        color: #fff;
        border-radius: 3px;
        text-align: center;
        line-height: 45px;
        text-decoration: none;
        margin: 0 auto 0px;
        border-bottom: 5px solid rgba(0, 0, 0, 0.06);
        display: table;
      }
  
      /* ** Media Query ** */
  
      /* ** End Media Query ** */
    </style>
  </head>
  
  <body width="100%" bgcolor="#f0f0f0" style="margin: 20px 0;">
    <div class="main-block" style=" background: #f0f0f0;">
      <table role="presentation" cellspacing="0" cellpadding="0" align="center"
        style="margin: auto; background: #fff; padding: 0px; border-radius: 15px; overflow: hidden; width: 800px;"
        class="email-container">
        <tbody>
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%"
              style="padding:15px;background: #058544">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <!-- <tr>
                        <td dir="ltr" valign="top" style="padding: 0px;">
                          <a href="#" target="_blank">
                            <img src="${process.env.BASE_URL}/logo.png"
                              alt="" width="150" height="75" alt="" border="0"
                              class="logo-wrap"
                              style="height: auto;display:block; margin:0 auto;">
                          </a>
                        </td>
                      </tr> -->
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                  <img src="${process.env.BASE_URL}/logo.png"
                      alt="" width="200" height="100" alt="" border="0"
                      class="logo-wrap"
                      style="height: auto; display:block; margin:0 auto;">
                      
                  </td>
                  <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                    <h1
                      style="font-size: 28px;font-weight: 500;color: #111;text-align: center;margin: 0 0 15px;">
                    Tax Invoice</h1>
                  </td>
                  <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                    <table>
                      <tr >
                        <td>Invoice No : ${orderData === null || orderData === void 0 ? void 0 : orderData.orderId}</td><br>
                       
                      </tr>
                      <tr>
                         <td>Order Date : ${new Date(orderData === null || orderData === void 0 ? void 0 : orderData.createdAt).toDateString()} </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0 15px;">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <tr>
                        <td dir="ltr" valign="top" style="padding: 15px; background: #fff;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%" style=" margin: 0 0 ;">
                            <tr>
                              <td width="50%" dir="ltr" valign="top" class="tab-main"
                                style="padding:25px; background:#fff7e9; border: 2px solid #fff7e9; border-radius: 5px 0 0 5px;">
                                <table role="presentation" cellspacing="0" cellpadding="0"
                                  border="0" style="padding:0 ;width: 100%;">
                                  <tr>
                                    <td style="padding: 0 0;width: 100%;"
                                      class="tablbx">
                                      <h3
                                        style="font-size: 22px;font-weight: 600;color: #111;margin: 0 0 15px; text-transform: uppercase;">
                                        Company  :</h3>
                                      <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                                        width="100%"
                                        style=" margin: 0 0 ; width: 100%;display: block;">
                                        <tr>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="
                                            text-align: left;
                                            font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            <b>Name </b> : &nbsp;&nbsp;
                                          </th>
  
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 15px;font-weight: normal;color: #111;padding: 5px 0;">
                                            DIPPARV VENTURES LLP
                                          </th>
                                        </tr>
  
                                        <tr>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            <b>Email</b>: &nbsp;&nbsp;
                                          </th>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            info@plywoodbazar.com
                                          </th>
  
                                        </tr>
  
                                        <tr>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            <b>Phone </b>: &nbsp;&nbsp;
                                          </th>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            +91 9403574184
                                            <!-- ${orderData === null || orderData === void 0 ? void 0 : orderData.totalAmount} -->
                                          </th>
                                        </tr>

                                        <tr>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            <b>Gst </b>: &nbsp;&nbsp;
                                          </th>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            27AARFD9394D1ZV
                                            <!-- ${orderData === null || orderData === void 0 ? void 0 : orderData.totalAmount} -->
                                          </th>
                                        </tr>

                                        <tr>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            <b>Address </b>: &nbsp;&nbsp;
                                          </th>
                                          <th width="50%" dir="ltr" valign="top"
                                            style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                            1516/161, Near B.Ed. College, 
                                            Akole Road, Shree Siddhivinayak Corporation, 
                                            Sangamner, Ahmednagar, Maharashtra, 422605
                                              India
                                            <!-- ${orderData === null || orderData === void 0 ? void 0 : orderData.totalAmount} -->
                                          </th>
                                        </tr>

                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
  
                              <td width="50%" dir="ltr" valign="top" class="tab-main"
                                style="padding:25px; background: #fff7e9; border: 2px solid #fff7e9; border-left: none; border-radius: 0 5px 5px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0"
                                  border="0" style="padding:0; margin: 0px;width: 100%;">
                                  <tr>
                                    <td style="padding: 0 0 ;width: 100%;"
                                      class="tablbx">
                                      <h3
                                        style="font-size: 22px;font-weight: 600;color: #111;margin: 0 0 15px; text-transform: uppercase;">
                                        BiLL To :</h3>
                                      <p
                                        style="font-size: 16px;font-weight: normal;color: #111; text-align:initial; padding: 8px 27px 1px 2px; line-height: 24px;">
                                        <b>Name</b>:
                                         ${((_b = (_a = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _a === void 0 ? void 0 : _a.companyObj) === null || _b === void 0 ? void 0 : _b.name)
        ? (_d = (_c = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _c === void 0 ? void 0 : _c.companyObj) === null || _d === void 0 ? void 0 : _d.name
        : (_e = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _e === void 0 ? void 0 : _e.name} 
  
                                          <br>
                                          <b>Phone</b> :
                                          ${((_g = (_f = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _f === void 0 ? void 0 : _f.companyObj) === null || _g === void 0 ? void 0 : _g.phone)
        ? (_j = (_h = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _h === void 0 ? void 0 : _h.companyObj) === null || _j === void 0 ? void 0 : _j.phone
        : (_k = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _k === void 0 ? void 0 : _k.phone} 
  
                                            <br>
                                            <b>Email</b> : 
                                            ${((_m = (_l = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _l === void 0 ? void 0 : _l.companyObj) === null || _m === void 0 ? void 0 : _m.email)
        ? (_p = (_o = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _o === void 0 ? void 0 : _o.companyObj) === null || _p === void 0 ? void 0 : _p.email
        : (_q = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _q === void 0 ? void 0 : _q.email} 
                                            
                                              <br>
                                                <br><b>Address</b>:
                                                    ${((_s = (_r = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _r === void 0 ? void 0 : _r.companyObj) === null || _s === void 0 ? void 0 : _s.address)
        ? (_u = (_t = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _t === void 0 ? void 0 : _t.companyObj) === null || _u === void 0 ? void 0 : _u.address
        : (_v = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _v === void 0 ? void 0 : _v.address} 
                                                    <br>
                                                    <b>GST</b> : 
                                                    ${((_x = (_w = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _w === void 0 ? void 0 : _w.companyObj) === null || _x === void 0 ? void 0 : _x.gstNumber)
        ? (_z = (_y = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _y === void 0 ? void 0 : _y.companyObj) === null || _z === void 0 ? void 0 : _z.gstNumber
        : (_0 = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _0 === void 0 ? void 0 : _0.gstNumber} 
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr>
            <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0 15px;">
              <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                width="100%">
                <tr>
                  <td class="stack-column-center">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <tr>
                        <td dir="ltr" valign="top" style="padding: 15px; background: #fff;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%" style=" margin: 0 0 ;">
                            <tr>
                              <!-- <th width="30%" dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal;color: #111;text-transform: uppercase;margin: 0;">
                                  Product Image</h6>
                              </th> -->
  
                              <th width="40%" dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal; text-align:initial; color: #111;text-transform: uppercase;margin: 0;">
                                  Description</h6>
                              </th>


                              <th  dir="ltr" valign="top"
                              style="padding: 10px;border-bottom: 1px solid #ddd;">
                              <h6 class="sz"
                                style="font-size: 16px;font-weight: normal; text-align:initial; color: #111;text-transform: uppercase;margin: 0;">
                                SAC Code</h6>
                            </th>
                             
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal; text-align:initial; color: #111;text-transform: uppercase;margin: 0;">
                                  Qty</h6>
                              </th>
  
  
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal; text-align:initial; color: #111;text-transform: uppercase;margin: 0;">
                                  Price</h6>
                              </th>
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal; text-align:initial; color: #111;text-transform: uppercase;margin: 0;">
                                  Tax</h6>
                              </th>
  
                              <th dir="ltr" valign="top"
                                style="padding: 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 16px;font-weight: normal; text-align:initial; color: #111;text-transform: uppercase;margin: 0;">
                                  Amount</h6>
                              </th>
                            </tr>
  
                            <tr>
                                
                                <td width="40%" dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                     ${orderData === null || orderData === void 0 ? void 0 : orderData.description} 
                                  </h6>
                                </td>
                                <td  dir="ltr" valign="middle"
                                style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                <h6 class="sz"
                                  style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                  998313
                                </h6>
                              </td>
                              
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                 1
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
  
                                    ₹ ${Math.round(orderData.price - (0, exports.getIncludesiveGST)(orderData.price, 18)).toFixed(2)}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
  
                                    ₹ ${(0, exports.getIncludesiveGST)(orderData.price, 18)} (18%)
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ₹ ${orderData.price.toFixed(2)} 
                                  </h6>
                                </td>
                              </tr>
                              
                          </table>
                      <tr>
                        <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%"
                          style="padding:0 15px;">
                          <table role="presentation" align="center" border="0" cellpadding="0"
                            cellspacing="0" width="100%">
                            <tr>
                              <td class="stack-column-center">
                                <table role="presentation" align="center" border="0"
                                  cellpadding="0" cellspacing="0" width="100%">
                                  <tr>
                                    <td width="50%" dir="ltr" valign="top"
                                      style="padding: 15px; background: #fff;"></td>
                                    <td dir="ltr" valign="top"
                                      style="padding: 15px; background: #fff;">
                                      <table role="presentation" align="center"
                                        border="0" cellpadding="0" cellspacing="0"
                                        width="100%" style=" margin: 0 0 ;">
                                        <tr>
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;color: #111;">
                                            Subtotal :
                                          </th>
  
                                          <th width="50%;"i
                                            style="padding: 5px;font-size: 16px;font-weight: 500;color: #111; text-align: right;">
                                            ₹ ${Math.round(orderData.price - (0, exports.getIncludesiveGST)(orderData.price, 18)).toFixed(2)}
                                          </th>
                                        </tr>
                                        
                                        
                                        ${((_1 = orderData === null || orderData === void 0 ? void 0 : orderData.user) === null || _1 === void 0 ? void 0 : _1.stateId) == "60f55de2214a00085e2f21cc"
        ? `
                                        <tr>
                                        <th width="50%;"
                                          style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                          <strong
                                            style="font-weight: bold;color: #111">
                                            GST (SGST : 9%)    </strong>
                                        </th>
  
                                        <th width="50%;"
                                          style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                          ₹ ${(0, exports.getGST)(Math.round(orderData.price - (0, exports.getIncludesiveGST)(orderData.price, 18)), 9)}
                                        </th>
                                      </tr>
                                      <tr>
                                      <th width="50%;"
                                        style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                        <strong
                                          style="font-weight: bold;color: #111">
                                          GST (CGST : 9%)   </strong>
                                      </th>

                                      <th width="50%;"
                                        style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                        ₹ ${(0, exports.getGST)(Math.round(orderData.price - (0, exports.getIncludesiveGST)(orderData.price, 18)), 9)}
                                      </th>
                                    </tr>`
        : `
                                      <tr>
                                      <th width="50%;"
                                        style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                        <strong
                                          style="font-weight: bold;color: #111">
                                          GST (IGST : 18%)  </strong>
                                      </th>

                                      <th width="50%;"
                                        style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                        ₹ ${(0, exports.getIncludesiveGST)(orderData.price, 18)}
                                      </th>
                                    </tr>
                                      `}
                                     

                                      
                                      
                                        <tr>
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;color: #111;">
                                            <strong
                                              style="font-weight: bold;color: #111">Order
                                              Total :</strong>
                                          </th>
  
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;color: #111; text-align: right;">
                                            ₹ ${orderData.price.toFixed(2)} 
                                          </th>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                   




                    <td bgcolor="#fff" dir="ltr" align="center" valign="top" width="100%" style="padding:0px;">
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0"
                      width="100%">
                      <tr>
                       
                        <td class="stack-column-center" style="padding:15px;margin: 15px 0;">
                         

                          <p>Declaration :- I/We hereby certify that our registration certificate under the GST Act, 2017 is in force on the date on which the sales of the goods specified on this 'Tax Invoice' is made by me/us and that the transaction of sale covered by this 'Tax Invoice' has been effected by me/us and it shall be accounted for in the turnover of sales while filing of return and the due tax, if any, payable on the sale has been paid or shall be paid.</p>
                          <p style="text-align: center;">Contact to plywoodbazar:+91 9403574184</p>
                          <p
                          style="font-size: 14px;font-weight: 500;color: #111;text-align: center;margin: 0 0 15px;">
                          Copyright 2023 . DIPPARV VENTURES LLP</p>
                        <p>
                            </td>
                      
                      </tr>
                    </table>
                  </td>
                </tr>
                   
                    </tbody>
                  </table>
                </div>
              </body>
            </html>`;
    return text;
};
exports.returnOnvoice = returnOnvoice;
