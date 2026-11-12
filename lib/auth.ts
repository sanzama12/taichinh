import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/services/auth.service";
import type { IUserSettings } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // Mặc định 30 ngày (sẽ được kiểm soát theo rememberDays)
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "access-key",
      name: "Mã Khóa Truy Cập (Access Key)",
      credentials: {
        key: { label: "Mã Khóa", type: "text" },
        rememberDays: { label: "Thời gian ghi nhớ", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.key) {
          throw new Error("Vui lòng nhập Mã khóa truy cập");
        }

        const rememberDays = credentials.rememberDays === "1" ? 1 : 30;

        // Gọi Service xác thực theo mô hình MVC
        const result = await AuthService.validateAccessKey(credentials.key, rememberDays);
        if (!result.isSuccess) {
          throw new Error(result.error);
        }

        return result.data;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.accessKey = user.accessKey;
        token.rememberDays = user.rememberDays || 30;
        token.settings = user.settings;
        token.picture = user.image;
        token.permissions = user.permissions;

        // Thiết lập thời gian sống của Token theo lựa chọn của người dùng (1 ngày hoặc 30 ngày)
        const durationSeconds = (user.rememberDays === 1 ? 1 : 30) * 24 * 60 * 60;
        token.exp = Math.floor(Date.now() / 1000) + durationSeconds;
      }

      if (trigger === "update" && session) {
        if (session.settings) token.settings = session.settings;
        if (session.image) token.picture = session.image;
        if (session.name) token.name = session.name;
        if (session.permissions) token.permissions = session.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "admin" | "user") || "user";
        session.user.accessKey = token.accessKey as string | undefined;
        session.user.rememberDays = (token.rememberDays as number) || 30;
        session.user.settings = token.settings as IUserSettings;
        session.user.permissions = token.permissions as any;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_super_secret_for_local_development_12345",
};
