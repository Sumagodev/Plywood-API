import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { Payment } from "../models/Payment.model";
import { SendBrevoMail } from "../service/brevoMail.service";
import test from "node:test";
import puppeteer from "puppeteer";
import { CONFIG } from "./config";
export const sendMail = async (emailArr: any, orderId: string, title: string, orderObj: any = {}) => {
  try {
    console.log(orderObj, "order response object data ki id se");

    if (orderObj && orderObj?.userId) {
      let orderData: any = await Payment.findById(`${orderId}`);
      if (orderData) {
        orderObj = orderData.orderObj;
      }
      let OrderHrml = await emailTemplate(orderObj);
      let invouiceHtml = await returnOnvoice(orderObj);
      let PdfUrl = await generatePdf(invouiceHtml, orderId);

      let temp = await SendBrevoMail(title, emailArr, OrderHrml, [{ url: PdfUrl, name: `${orderId}.pdf` }]);

      // let temp = await SendBrevoMail(title, emailArr, emailTemplate(orderObj));
      console.log("==========================temp===temp-----");
    }

    if (orderObj && orderObj?.email) {
      let temp = await SendBrevoMail(title, emailArr, registerTemplate());
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const emailTemplate = (orderData: any) => {
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

                                            <h4>Subscription:${orderData?.name}</h4>
                                            <h4>Description:${orderData?.description}</h4>
                                            <h4>Price:${orderData?.price}</h4>
                                            <h4>Number Of Sales:${orderData?.numberOfSales}</h4>
                                            <h4>StartDate:${new Date(orderData?.startDate).toDateString()}</h4>
    

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
export const registerTemplate = () => {
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
export const returnHtmlOrder = (orderData: any) => {
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
                                        ${orderData?.orderId}
                                      </th>
                                    </tr>

                                    <tr>
                                      <th width="50%" dir="ltr" valign="top"
                                        style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                        <b>Order Date</b>: &nbsp;&nbsp;
                                      </th>
                                      <th width="50%" dir="ltr" valign="top"
                                        style="text-align: left; font-size: 16px;font-weight: normal;color: #111;padding: 5px 0;">
                                        ${new Date(orderData?.createdAt).toDateString()}
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
                                        <b>Name</b>: ${orderData?.addressObj?.firstName}
  
                                          <br>
                                          <b>Phone</b> : ${orderData?.addressObj?.phone} 
  
                                            <br>
                                            <b>Email</b> : ${orderData?.addressObj?.email} 
                                            
                                              <br>
                                              <b>Pincode</b> : ${orderData?.addressObj?.pincode}
                                                 
  
                                                <br><b>Address</b>: ${orderData?.addressObj?.street}
                                                  
                                                  &nbsp;, ${orderData?.addressObj?.city}
                                                     
                                                    &nbsp;, ${orderData?.addressObj?.state}		
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
  
                            ${orderData.productsArr.reduce(
                              (acc: any, el: any, i: number) =>
                                acc +
                                `
                            <tr>
                                <td width="30%" dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
  
                                  <img src="https://apitouch.ebslonserver3.com/uploads/${
                                    orderData?.productsArr[i].image
                                  }"
                                    height="100px" width="100px" alt="product image">
  
                                </td>
                                <td width="50%" dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ${orderData?.productsArr[i].name}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ${orderData?.productsArr[i].quantity}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
  
                                    ${orderData?.productsArr[i].price}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 16px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
                                    ${Math.round(orderData?.productsArr[i].price * orderData?.productsArr[i].quantity)}
                                  </h6>
                                </td>
                              </tr>
                            `,
                              ""
                            )}
                              
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
                                            ${orderData?.subTotalAmount}
                                          </th>
                                        </tr>
                                        ${
                                          orderData?.dicountObj && orderData?.dicountObj?.code
                                            ? `    <tr>
                                              <th width="50%;"
                                              style="padding: 5px;font-size: 16px;font-weight: 500;color: #111;">
                                                Discount (${orderData?.dicountObj?.code}) 
                                              </th>
      
                                              <th width="50%;"
                                                style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                                - ₹ ${orderData?.dicountObj?.amount}
                                              </th>
                                            </tr>`
                                            : ""
                                        }
                            
                                    
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

                                        ${
                                          orderData?.giftwarp == true
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
                                            : ""
                                        }



                                      
                                        <tr>
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500; color: #111;">
                                            <strong
                                              style="font-weight: bold;color: #111">Order
                                              Total :</strong>
                                          </th>
  
                                          <th width="50%;"
                                            style="padding: 5px;font-size: 16px;font-weight: 500;  text-align: right;">
                                            ${orderData?.totalAmount}
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

export const generatePdf = async (html: any, orderId: string) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    // Create a new page
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType("screen");

    // Downlaod the PDF
    let pdf = await page.pdf({
      path: `public/invoice/${orderId}.pdf`,
      format: "A4",
    });

    let invoiceUrl = `invoice/${orderId}.pdf`;
    // let invoiceUrl = `${LOCALURL.LIVEURL}/invoice/${orderData._id}.pdf`;
    console.log(invoiceUrl, "invoiceUrl invoiceUrl");

    fs.writeFile(path.join(__dirname, "../../public/invoice/", `${orderId}.pdf`), pdf, {}, (err) => {
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
    await browser.close();

    return invoiceUrl;
    // res.status(200).json({ message: "success", data: invoiceUrl, success: true });
    // Close the browser instance
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const getIncludesiveGST = (amount: number, rate: number): any => {
  return (amount - amount / (1 + rate / 100)).toFixed(2);
};

export const getGST = (amount: number, rate: number): any => {
  return ((amount * rate) / 100).toFixed(2);
};
export const returnOnvoice = (orderData: any) => {
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
                        <td>Invoice No : ${orderData?.orderId}</td><br>
                       
                      </tr>
                      <tr>
                         <td>Order Date : ${new Date(orderData?.createdAt).toDateString()} </td>
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
                                            <!-- ${orderData?.totalAmount} -->
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
                                            <!-- ${orderData?.totalAmount} -->
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
                                            <!-- ${orderData?.totalAmount} -->
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
                                         ${
                                           orderData?.user?.companyObj?.name
                                             ? orderData?.user?.companyObj?.name
                                             : orderData?.user?.name
                                         } 
  
                                          <br>
                                          <b>Phone</b> :
                                          ${
                                            orderData?.user?.companyObj?.phone
                                              ? orderData?.user?.companyObj?.phone
                                              : orderData?.user?.phone
                                          } 
  
                                            <br>
                                            <b>Email</b> : 
                                            ${
                                              orderData?.user?.companyObj?.email
                                                ? orderData?.user?.companyObj?.email
                                                : orderData?.user?.email
                                            } 
                                            
                                              <br>
                                                <br><b>Address</b>:
                                                    ${
                                                      orderData?.user?.companyObj?.address
                                                        ? orderData?.user?.companyObj?.address
                                                        : orderData?.user?.address
                                                    } 
                                                    <br>
                                                    <b>GST</b> : 
                                                    ${
                                                      orderData?.user?.companyObj?.gstNumber
                                                        ? orderData?.user?.companyObj?.gstNumber
                                                        : orderData?.user?.gstNumber
                                                    } 
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
                                     ${orderData?.description} 
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
  
                                    ₹ ${Math.round(orderData.price - getIncludesiveGST(orderData.price, 18)).toFixed(2)}
                                  </h6>
                                </td>
                                <td dir="ltr" valign="middle"
                                  style="padding: 15px 10px;border-bottom: 1px solid #ddd;">
                                  <h6 class="sz"
                                    style="font-size: 12px;font-weight:normal;color: #111;text-transform: uppercase;margin: 0;">
  
                                    ₹ ${getIncludesiveGST(orderData.price, 18)} (18%)
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
                                            ₹ ${Math.round(
                                              orderData.price - getIncludesiveGST(orderData.price, 18)
                                            ).toFixed(2)}
                                          </th>
                                        </tr>
                                        
                                        
                                        ${
                                          orderData?.user?.stateId == "60f55de2214a00085e2f21cc"
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
                                          ₹ ${getGST(
                                            Math.round(orderData.price - getIncludesiveGST(orderData.price, 18)),
                                            9
                                          )}
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
                                        ₹ ${getGST(
                                          Math.round(orderData.price - getIncludesiveGST(orderData.price, 18)),
                                          9
                                        )}
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
                                        ₹ ${getIncludesiveGST(orderData.price, 18)}
                                      </th>
                                    </tr>
                                      `
                                        }
                                     

                                      
                                      
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
