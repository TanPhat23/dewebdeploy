import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  debug: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.githubUsername = (profile as { login?: string }).login;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.githubUsername && session.user) {
        session.user.name = token.githubUsername as string;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
