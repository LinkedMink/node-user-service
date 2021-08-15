import Email from "email-templates";
import nodemailer, { TransportOptions } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

import { config } from "./Config";
import { ConfigKey } from "./ConfigKey";
import { Logger } from "./Logger";

export class EmailSender {
  private static instance: EmailSender;
  private readonly logger = Logger.get(EmailSender.name);
  private readonly email = this.getRenderer();

  static get(): EmailSender {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new EmailSender();
    return this.instance;
  }

  sendVerifyEmail = (toEmail: string, verifyCode: string): Promise<boolean> => {
    return this.email
      .send({
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
      })
      .then(res => true)
      .catch(e => {
        this.logger.error({ message: e as Error });
        return false;
      });
  };

  sendPasswordReset = (toEmail: string, resetCode: string): Promise<boolean> => {
    return this.email
      .send({
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
      })
      .then(res => true)
      .catch(e => {
        this.logger.error({ message: e as Error });
        return false;
      });
  };

  private getRenderer() {
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

    return new Email(emailOptions);
  }
}
