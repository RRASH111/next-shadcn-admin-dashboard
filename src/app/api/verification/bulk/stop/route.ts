import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { MillionVerifierAPI, APIError } from '@/lib/millionverifier';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get file ID from request body
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Initialize MillionVerifier API with environment key
    const api = new MillionVerifierAPI();

    // Stop bulk processing
    const result = await api.stopBulkProcessing(fileId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Update local database
    await prisma.bulkJob.updateMany({
      where: {
        userId: user.id,
        fileId: fileId
      },
      data: {
        status: 'canceled',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Bulk processing stopped successfully' });

  } catch (error) {
    console.error('Stop bulk processing error:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
