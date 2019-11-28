import Email from "email-templates";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import { ConfigKey, getConfigValue } from "../infastructure/config";

const loadTransportConfig = () => {
  const config = getConfigValue(ConfigKey.NodeMailerTransport).trim();
  if (config[0] === "{") {
    return JSON.parse(config);
  }

  return config;
};

const emailOptions = {
  message: {
    from: getConfigValue(ConfigKey.SystemEmailAddress),
  },
  transport: {
    jsonTransport: true,
  } as any,
  send: false,
};

const transportConfig = loadTransportConfig();
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
      appName: getConfigValue(ConfigKey.AppName),
      email: encodeURIComponent(toEmail),
      code: verifyCode,
      url: getConfigValue(ConfigKey.ServiceBaseUrl),
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
      appName: getConfigValue(ConfigKey.AppName),
      email: encodeURIComponent(toEmail),
      code: resetCode,
      url: getConfigValue(ConfigKey.PasswordResetUiUrl),
    },
  });
};
