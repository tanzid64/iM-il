import { db } from "@/server/db";
import crypto from "crypto";
import { NextRequest } from "next/server";

const AURINKO_SIGNING_SECRET = process.env.NODE_ENV;

export const POST = async (req: NextRequest) => {
  /*
  Aurinko webhooks for realtime update
  Read More: https://docs.aurinko.io/unified-apis/webhooks-api
  */

  // debug purpose in development
  if (process.env.NODE_ENV === "development")
    console.log("Post request received from aurinko webhook");

  // Get query params
  const query = req.nextUrl.searchParams;

  const validationToken = query.get("validationToken");
  if (validationToken) return new Response(validationToken, { status: 200 });

  // get data from request headers & body
  const timestamp = req.headers.get("X-Aurinko-Request-Timestamp");
  const signature = req.headers.get("X-Aurinko-Signature");
  const body = await req.text();

  // validate data
  if (!timestamp || !signature || !body)
    return new Response("Bad Request", { status: 400 });

  const basestring = `v0:${timestamp}:${body}`;
  const expectedSignature = crypto
    .createHmac("sha256", AURINKO_SIGNING_SECRET!)
    .update(basestring)
    .digest("hex");

  // validate signature
  if (signature !== expectedSignature)
    return new Response("Unauthorized", { status: 401 });

  // decleare type
  type AurinkoNotification = {
    subscription: number;
    resource: string;
    accountId: number;
    payloads: {
      id: string;
      changeType: string;
      attributes: {
        threadId: string;
      };
    }[];
  };

  const payload = JSON.parse(body) as AurinkoNotification;
  // debug purpose in development
  if (process.env.NODE_ENV === "development")
    console.log("Received notification:", JSON.stringify(payload, null, 2));

  // Get account from db
  const account = await db.emailAccountProfile.findUnique({
    where: {
      id: payload.accountId.toString(),
    },
  });

  // validate account
  if (!account) return new Response("Account not found", { status: 404 });

  // TODO: sync emails

  return new Response("OK", { status: 200 });
};
