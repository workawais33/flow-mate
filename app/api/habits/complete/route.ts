import jwt, { JwtPayload } from "jsonwebtoken";
import { Habit } from "@/models/Habit";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface CompleteBody {
  id: string;
  date: string;
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

export async function PUT(req: Request) {
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

  const { id, date }: CompleteBody = await req.json();

  const habit = await Habit.findOne({ _id: id, userId });

  if (!habit) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (habit.completedDates.includes(date)) {
    return NextResponse.json(habit);
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toISOString().split("T")[0];

  const didYesterday = habit.completedDates.includes(yDate);

  if (habit.completedDates.length === 0) {
    habit.streak = 1;
  } else if (didYesterday) {
    habit.streak += 1;
  } else {
    habit.streak = 1;
  }

  habit.completedDates.push(date);

  await habit.save();

  return NextResponse.json(habit);
}