import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

interface DecodedToken extends JwtPayload {
  id?: string;
  email?: string;
  hasAccess?: boolean;
  plan?: string;
}

export async function getUserIdFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.id || null;
  } catch (error) {
    console.error("Error getting userId from cookie:", (error as Error).message);
    return null;
  }
}

export async function getUserFromCookie(): Promise<DecodedToken | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Error getting user from cookie:", (error as Error).message);
    return null;
  }
}