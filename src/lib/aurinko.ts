"use server";

import { db } from "@/server/db";
import { getAuthUserID } from "./user";

export const getAurinkoAuthorizationUrl = async (
  serviceType: "Google" | "Office365",
) => {
  /*
  Aurinko API Authentication
  Read More: https://apirefs.aurinko.io/#section/API-Authentication
  */
  const userId = await getAuthUserID();
  if (!userId) throw new Error("User not found");

  // Get user data from db
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  // Todo: implement payment subscription functionalities

  // Get total number of email accounts added by user
  const accounts = await db.emailAccountProfile.count({
    // ! Will need this while implementing payment subscription
    where: {
      id: userId,
    },
  });

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};
