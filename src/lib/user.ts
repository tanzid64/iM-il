/*
Get necessary user data that needs for server actions
*/

"use server";

import { auth } from "@/server/auth";

export const getAuthUserID = async () => {
  const session = await auth();

  if (session?.user) {
    return session.user.id;
  }

  return null;
};
