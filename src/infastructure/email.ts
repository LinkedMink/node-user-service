import Email from "email-templates";
import nodemailer from "nodemailer";

import { ConfigKey, getConfigValue } from "../infastructure/config";

const loadTransportConfig = () => {
  const config = getConfigValue(ConfigKey.NodeMailerTransport).trim();
  if (config[0] === "{") {
    return JSON.parse(config);
  }

  return config;
};

const transporter = nodemailer.createTransport(loadTransportConfig());

const email = new Email({
  message: {
    from: getConfigValue(ConfigKey.SystemEmailAddress),
  },
  transport: transporter,
  send: true,
});

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
