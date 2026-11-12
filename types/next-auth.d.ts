import type { DefaultSession } from "next-auth";
import type { IUserSettings } from "@/models/User";
import type { IUserPermissions } from "@/types/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
      accessKey?: string;
      rememberDays?: number;
      settings?: IUserSettings;
      permissions?: IUserPermissions;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "admin" | "user";
    accessKey?: string;
    rememberDays?: number;
    settings?: IUserSettings;
    permissions?: IUserPermissions;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "admin" | "user";
    accessKey?: string;
    rememberDays?: number;
    settings?: IUserSettings;
    permissions?: IUserPermissions;
  }
}
