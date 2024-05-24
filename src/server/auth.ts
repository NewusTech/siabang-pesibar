import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      dinas: {
        id: string
        name: string
      },
      role: string
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // callbacks: {
  //   session: ({ session, user }) => ({
  //     ...session,
  //     user: {
  //       ...session.user,
  //       id: user.id,
  //     },
  //   }),
  // },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const user = await db.user.findFirst({
          where: { email: credentials?.email },
          include: { Dinas: { select: { id: true, name: true } } }
        });

        if (!user) {
          throw new Error("Wrong credentials. Try again. 1");
        }

        if (!credentials?.password) {
          throw new Error("Wrong credentials. Try again. 2");
        }
        // console.log("password", credentials.password)

        // const match = await bcrypt.compare(credentials?.password, user.password);
        // console.log("match",match)
        // if (!match) {
        //   throw new Error("Wrong credentials. Try again. 3");
        // }
        return { ...user };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 2592000 },
  callbacks: {
    signIn: async ({ user }) => {
      if (!user) {
        return false;
      }
      return true;
    },
    jwt: async ({ token, account, user }) => {
      if (!token) {
        return {};
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        // @ts-ignore
        token.role = user.role
        // @ts-ignore
        token.dinas = { id: user?.Dinas?.id, name: user?.Dinas?.name }
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user = {
        // @ts-ignore
        id: token.sub,
        // @ts-ignore
        dinas: token.dinas,
        // @ts-ignore
        role: token.role,
        ...session.user,
      };
      return session;
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
