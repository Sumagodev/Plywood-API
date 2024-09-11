import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const url = process.env.FRONTEND_BASE_URL


// const fs = require('fs')
export const sendMail = async (email: String, message: String) => {
    try {
        console.log(email)
        // create reusable transporter object using the default SMTP transport
        // let emailSettingsObj = await EmailSettings.findOne().exec()

        // send mail with defined transport object
        let transporterObj = nodemailer.createTransport(new SMTPTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: false, // use SSL
            logger: true,
            debug: true,
            ignoreTLS: true, // add this 
            auth: {
                user: "seniorab404@gmail.com",
                pass: "zjegdeypusvdbjen",
            },
        }));
        console.log(transporterObj)
        const transporter = nodemailer.createTransport(transporterObj);
        // console.log(transporter, "transporter")
        let obj: any = {
            from: 'seniorab404@gmail.com', // sender address
            to: email, // list of receivers
            subject: "You have recieved otp to login to PlywoodBazar", // Subject line
            text: `Your otp is ${message}`, // plain text body
            // html: `LinkedIn account is not logged in please login now <a href="${linkedLoginUrl}">${linkedLoginUrl}</a>`, // plain text body
        }
        console.log(obj, "ASDF")
        let temp = await transporter.sendMail(obj, function (error, info) {
            if (error) {
                console.log(error, "err");
            } else {
                console.log('Email sent: ' + info.response);
            }
        });;
        console.log(temp)




        return true

    } catch (error) {
        console.error(error)
        return false
    }
}



