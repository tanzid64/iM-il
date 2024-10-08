"use server";

import { db } from "@/server/db";
import axios from "axios";
import { getAuthUserID } from "./user";
import { EmailMessage } from "./types";

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

export const getAurinkoToken = async (code: string) => {
  /*
  To start a aurinko user session request for an access token
  Read More: https://apirefs.aurinko.io/#section/API-Authentication
  */
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRET as string,
        },
      },
    );

    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching Aurinko token:", error.response?.data);
    } else {
      console.error("Unexpected error fetching Aurinko token:", error);
    }
  }
};

export const getAccountDetails = async (accessToken: string) => {
  /*
  Get aurinko user details based on access token that is received from getAurinkoToken function
  Read More: https://apirefs.aurinko.io/#section/API-Authentication
  */
  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching account details:", error.response?.data);
    } else {
      console.error("Unexpected error fetching account details:", error);
    }
    throw error;
  }
};

export const getEmailDetails = async (accessToken: string, emailId: string) => {
  /*
  Get email details based on email id
  Read More: https://apirefs.aurinko.io/#section/API-Authentication
  */
  try {
    const response = await axios.get<EmailMessage>(
      `https://api.aurinko.io/v1/email/messages/${emailId}`,
      {
        params: {
          loadInlines: true,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching email details:", error.response?.data);
    } else {
      console.error("Unexpected error fetching email details:", error);
    }
    throw error;
  }
};