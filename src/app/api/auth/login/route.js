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
    const email = sanitizeInput(body.email);
    const password = body.password;

    if (!email || !isValidEmail(email)) {
      return errorResponse('Please provide a valid email address', 400);
    }

    if (!password || password.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse('Invalid email or password', 401);
    }

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

    const response = NextResponse.json(responseData, { status: 200 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
