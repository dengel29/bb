import { ServerClient } from "postmark";
import { loadConfig } from "../load-config.js";

const config = loadConfig();

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
  const mailer = new ServerClient(
    config[`${process.env.NODE_ENV}_POSTMARK_API_TOKEN`]
  );

  await mailer.sendEmail({
    From: from,
    To: to,
    Subject: subject,
    TextBody: textBody,
    HtmlBody: htmlBody,
  });
};
