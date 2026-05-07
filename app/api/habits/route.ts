import jwt, { JwtPayload } from "jsonwebtoken";
import { Habit } from "@/models/Habit";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface HabitBody {
  title: string;
}

interface DecodedToken extends JwtPayload {
  id?: string;
}

function getUserId(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    return decoded.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = getUserId(token);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: HabitBody = await req.json();

  const habit = await Habit.create({
    userId,
    title: body.title,
    streak: 0,
    completedDates: [],
  });

  return NextResponse.json(habit);
}

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json([], { status: 200 });
  }

  const userId = getUserId(token);

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

  return NextResponse.json(habits);
}