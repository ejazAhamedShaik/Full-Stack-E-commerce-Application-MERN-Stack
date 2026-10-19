import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const SEND_EMAIL = async (options, callback) => {
  try {
    const info = await transporter.sendMail(options);
    callback(info);
  } catch (e) {
    console.log(e);
  }
};

// const message = "This is my email sent using nodemailer package";
// const options = {
//   from: process.env.EMAIL,
//   to: "ejazahamed.shaik@outlook.com",
//   subject: "Email using nodemailer",
//   text: message,
//   html: `<strong>${message}</strong>`,
// };

// SEND_EMAIL(options, (info) => {
//   console.log(info);
// });

const HTML_TEMPLATE = (text) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>NodeMailer Email Template</title>
          <style>
            .container {
              width: 100%;
              height: 100%;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email {
              width: 80%;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
            }
            .email-header {
              background-color: #333;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
            .email-body {
              padding: 20px;
            }
            .email-footer {
              background-color: #333;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email">
              <div class="email-header">
                <h1>OTP for reset</h1>
              </div>
              <div class="email-body">
                <p>${text}</p>
              </div>
              <div class="email-footer">
                <p>EMAIL FOOTER</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
};

const emailBuilder = (to, subject, message) => {
  const options = {
    from: process.env.EMAIL,
    to,
    subject,
    text: message,
    html: HTML_TEMPLATE(message),
  };

  SEND_EMAIL(options, (info) => {
    console.log(info.email);
  });
};

export { SEND_EMAIL, emailBuilder };
