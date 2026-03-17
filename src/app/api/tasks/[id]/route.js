import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserFromRequest, validateTask, sanitizeInput, errorResponse } from '@/lib/apiUtils';
import { encryptPayload } from '@/lib/encryption';

export async function GET(request, { params }) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid task ID', 400);
    }

    await connectDB();

    const task = await Task.findById(id).lean();

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    if (task.userId.toString() !== userId) {
      return errorResponse('Forbidden: You do not have access to this task', 403);
    }

    return NextResponse.json({
      success: true,
      data: encryptPayload({ task }),
      encrypted: true,
    });
  } catch (error) {
    console.error('Get task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid task ID', 400);
    }

    await connectDB();

    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    if (existingTask.userId.toString() !== userId) {
      return errorResponse('Forbidden: You do not have access to this task', 403);
    }

    const body = await request.json();
    const updateData = {};

    if (body.title !== undefined) {
      updateData.title = sanitizeInput(body.title);
    }
    if (body.description !== undefined) {
      updateData.description = sanitizeInput(body.description);
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    const validation = validateTask({
      title: updateData.title || existingTask.title,
      description: updateData.description !== undefined ? updateData.description : existingTask.description,
      status: updateData.status || existingTask.status,
    });

    if (!validation.valid) {
      return errorResponse(validation.errors.join(', '), 400);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      success: true,
      data: encryptPayload({ task: updatedTask }),
      encrypted: true,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid task ID', 400);
    }

    await connectDB();

    const task = await Task.findById(id);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    if (task.userId.toString() !== userId) {
      return errorResponse('Forbidden: You do not have access to this task', 403);
    }

    await Task.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return errorResponse('Internal server error', 500);
  }
}
