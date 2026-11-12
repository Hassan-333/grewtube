import NextAuth from "next-auth";
import { authOptions } from "@/app/api/auth/nextauth-options";  

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);



