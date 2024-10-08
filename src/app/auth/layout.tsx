'use client';
import { auth } from "@/server/auth";
import { useSession } from "next-auth/react";
type Props = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex h-screen items-center justify-center">{children}</div>
  );
};

export default AuthLayout;
