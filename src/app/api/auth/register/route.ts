import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required");
    }

    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters");
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: "credentials",
    });

    return successResponse(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      201
    );
  } catch (err) {
    console.error("Registration error:", err);
    return errorResponse("Failed to create account", 500);
  }
}
