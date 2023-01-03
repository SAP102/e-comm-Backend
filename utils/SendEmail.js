const nodemailer = require("nodemailer");
const nodemailerConfig = require("./NodeMailerConfig");

const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport(nodemailerConfig)

  return transporter.sendMail({
    from:"sahilpethani50@gmail.com",
    to:options.email,
    subject:options.subject,
    html:options.data
  })
};

module.exports = sendEmail;
