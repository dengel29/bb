import { ServerClient } from "postmark";
import { appConfig } from "../config/index.js";

export const sendEmail = async ({
  from,
  to,
  subject,
  textBody,
  htmlBody,
}: {
  from: string;
  to: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
}) => {
  const mailer = new ServerClient(appConfig.POSTMARK_API_TOKEN);

  await mailer.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    TextBody: textBody,
    HtmlBody: htmlBody,
  });
};
