import GitHubProvider from "next-auth/providers/github"

/* eslint-disable @typescript-eslint/no-explicit-any */
export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  debug: true,
  callbacks: {
    async jwt(params: { token: any; account: any; profile?: any }) {
      const { token, account, profile } = params
      if (account && profile) {
        token.githubUsername = profile.login
        token.accessToken = account.access_token
      }
      return token
    },
    async session(params: { session: any; token: any }) {
      const { session, token } = params
      if (token.githubUsername && session.user) {
        session.user.name = token.githubUsername as string
      }
      session.accessToken = token.accessToken
      return session
    },
  },
}