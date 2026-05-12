import { getUserIdFromCookie } from "./auth";
import User from "@/models/User";
import { connectDB } from "./db";

export async function isAdmin(): Promise<boolean> {
  try {
    const userId = await getUserIdFromCookie();
    if (!userId) return false;
    
    await connectDB();
    const user = await User.findById(userId);
    return user?.isAdmin === true;
  } catch (error) {
    return false;
  }
}