const sendgridMail = require("@sendgrid/mail");
require("dotenv").config();

function sendEmail({ to, subject, html }) {
  sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

  sendgridMail.send({
    from: "vitaliigubariev@gmail.com",
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
