import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest, errorResponse } from '@/lib/apiUtils';

export async function GET(request) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();
    const user = await User.findById(userId).select('name email');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return errorResponse('Internal server error', 500);
  }
}
