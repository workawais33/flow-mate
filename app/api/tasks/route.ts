import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface TaskBody {
  title: string;
}

interface DecodedToken extends JwtPayload {
  id?: string;
}

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  await connectDB();

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { title }: TaskBody = await req.json();

  const task = await Task.create({
    title,
    userId,
  });

  return NextResponse.json({ task }, { status: 201 });
}

export async function GET() {
  await connectDB();

  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

  return NextResponse.json({ tasks });
}