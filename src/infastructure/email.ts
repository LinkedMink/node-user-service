import Email from "email-templates";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import { config, ConfigKey } from "../infastructure/config";

const emailOptions = {
  message: {
    from: config.getString(ConfigKey.SystemEmailAddress),
  },
  transport: {
    jsonTransport: true,
  } as any,
  send: false,
};

const transportConfig = config.getJsonOrString(ConfigKey.NodeMailerTransport);
let transporter: Mail;
if (transportConfig) {
  transporter = nodemailer.createTransport(transportConfig);
  emailOptions.transport = transporter;
  emailOptions.send = true;
}

const email = new Email(emailOptions);

export const sendVerifyEmail = (toEmail: string, verifyCode: string) => {
  return email.send({
    template: "verifyEmail",
    message: {
      to: toEmail,
    },
    locals: {
      appName: config.getString(ConfigKey.AppName),
      email: encodeURIComponent(toEmail),
      code: verifyCode,
      url: config.getString(ConfigKey.ServiceBaseUrl),
    },
  });
};

export const sendPasswordReset = (toEmail: string, resetCode: string) => {
  return email.send({
    template: "passwordReset",
    message: {
      to: toEmail,
    },
    locals: {
      appName: config.getString(ConfigKey.AppName),
      email: encodeURIComponent(toEmail),
      code: resetCode,
      url: config.getString(ConfigKey.PasswordResetUiUrl),
    },
  });
};
