import type { NextAuthConfig } from "next-auth";
type SessionProps = {
  session: any;
  token: any;
};
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/",
    signIn: "/auth",
    signOut: "/auth",
  },
  callbacks: {
    authorized({ auth }) {
      const isAuthenticated = !!auth?.user;

      return isAuthenticated;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }: SessionProps) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
