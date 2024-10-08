import { getAccountDetails, getAurinkoToken } from "@/lib/aurinko";
import { getAuthUserID } from "@/lib/user";
import { db } from "@/server/db";
import { waitUntil } from "@vercel/functions";
import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  // User validation check
  const userId = await getAuthUserID();
  if (!userId)
    return NextResponse.json(
      {
        error: "UNAUTHORIZED",
      },
      {
        status: 401,
      },
    );

  // validate callback response
  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success")
    return NextResponse.json(
      {
        error: "Account connection failed",
      },
      {
        status: 400,
      },
    );

  // get code from callback url params and send for token request to aurinko
  const code = params.get("code");
  const token = await getAurinkoToken(code as string);
  if (!token)
    return NextResponse.json(
      {
        error: "Failed to fetch token",
      },
      {
        status: 400,
      },
    );

  // Get aurinko account details based on access token
  const accountDetails = await getAccountDetails(token.accessToken);
  // save account details in db
  await db.emailAccountProfile.upsert({
    where: {
      id: token.accountId.toString(),
    },
    create: {
      id: token.accountId.toString(),
      userId,
      token: token.accessToken,
      provider: "Aurinko",
      emailAddress: accountDetails.email,
      name: accountDetails.name,
    },
    update: {
      token: token.accessToken,
    },
  });

  // sync all email
  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      }),
  );
  return NextResponse.redirect(new URL("/mail", req.url));
};
