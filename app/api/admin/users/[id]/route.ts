import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { isBlocked, subscriptionPlan, isPaid } = await req.json();
    
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;
    if (isPaid !== undefined) user.isPaid = isPaid;
    
    await user.save();
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    await User.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}