import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserFromRequest, validateTask, sanitizeInput, errorResponse, successResponse } from '@/lib/apiUtils';
import { encryptPayload } from '@/lib/encryption';

export async function GET(request) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit')) || 10));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query = { userId };

    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim()) {
      const sanitizedSearch = sanitizeInput(search);
      query.title = { $regex: sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    const responseData = {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    return successResponse({
      data: encryptPayload(responseData),
      encrypted: true,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await request.json();
    const taskData = {
      title: sanitizeInput(body.title),
      description: sanitizeInput(body.description || ''),
      status: body.status || 'todo',
    };

    const validation = validateTask(taskData);
    if (!validation.valid) {
      return errorResponse(validation.errors.join(', '), 400);
    }

    const task = await Task.create({
      ...taskData,
      userId,
    });

    return Response.json(
      {
        success: true,
        data: encryptPayload({ task }),
        encrypted: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create task error:', error);
    return errorResponse('Internal server error', 500);
  }
}
