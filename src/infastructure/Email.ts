import Email from "email-templates";
import nodemailer, { TransportOptions } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import { config, ConfigKey } from "./Config";

const emailOptions = {
  message: {
    from: config.getString(ConfigKey.SystemEmailAddress),
  },
  transport: {
    jsonTransport: true,
  } as unknown as Mail,
  send: false,
};

const transportConfig = config.getJsonOrString<TransportOptions>(ConfigKey.NodeMailerTransport);
let transporter: Mail;
if (transportConfig) {
  transporter = nodemailer.createTransport(transportConfig);
  emailOptions.transport = transporter;
  emailOptions.send = true;
}

const email = new Email(emailOptions);

export const sendVerifyEmail = (toEmail: string, verifyCode: string): Promise<void> => {
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

export const sendPasswordReset = (toEmail: string, resetCode: string): Promise<void> => {
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
