const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = class Email {
  constructor(user, resetCode) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.resetCode = resetCode;
    this.from = `Eunoia <${process.env.GMAIL_USERNAME}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      resetCode: this.resetCode,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Eunoia Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 15 minutes)'
    );
  }
  async sendPasswordchanged() {
    await this.send('passwordChanged', 'Your password has been changed.');
  }
  async sendRequestAccepted() {
    await this.send('requestAccepted', 'Your Request has been accepted.');
  }
  async sendRequestDecline() {
    await this.send('requestDecline', 'Your Request has been Deslined.');
  }
};
