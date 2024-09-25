const nodemailer = require('nodemailer');
const dotenv=require('dotenv');
dotenv.config();

const sendEmail = async (email, subject, text) => {
    try {
        const trasporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        });
        await trasporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        });
        console.log("Email Sent Successfully");
    } catch (error) {
        console.log(error, "email not sent");

    }
}

module.exports = { sendEmail };