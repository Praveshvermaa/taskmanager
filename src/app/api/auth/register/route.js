import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';
import { encryptPayload } from '@/lib/encryption';
import { sanitizeInput, isValidEmail, errorResponse } from '@/lib/apiUtils';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const name = sanitizeInput(body.name);
    const email = sanitizeInput(body.email);
    const password = body.password;

    if (!name || name.length < 2 || name.length > 50) {
      return errorResponse('Name must be between 2 and 50 characters', 400);
    }

    if (!email || !isValidEmail(email)) {
      return errorResponse('Please provide a valid email address', 400);
    }

    if (!password || password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('An account with this email already exists', 409);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = signToken(user._id.toString());
    const responseData = {
      success: true,
      data: encryptPayload({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      }),
      encrypted: true,
    };

    const response = NextResponse.json(responseData, { status: 201 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Internal server error', 500);
  }
}
