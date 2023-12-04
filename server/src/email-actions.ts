import { ServerClient } from "postmark";
import { config } from "../config.js";

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
  const mailer = new ServerClient(config.dev.postmarkApiToken);

  await mailer.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    TextBody: textBody,
    HtmlBody: htmlBody,
  });
};
