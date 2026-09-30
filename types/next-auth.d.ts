import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    /** Parol belgisi — parol almashsa token kuchini yo'qotadi */
    pwdv?: string;
    /** Token bekor qilingan (hisob o'chirilgan yoki parol almashgan) */
    revoked?: boolean;
  }
}
