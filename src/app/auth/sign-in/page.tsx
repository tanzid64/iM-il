"use client";

import { signIn } from "next-auth/react";

const SignInPage = () => {
  return (
    <div>
      <button onClick={() => signIn("google", { callbackUrl: "/" })}>
        google
      </button>
    </div>
  );
};

export default SignInPage;
