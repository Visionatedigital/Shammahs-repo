import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
=======
import { writeFile } from 'fs/promises';
import { join } from 'path';
>>>>>>> f9e815a3074bf72ca7c8f7206a627d49d2362fa0
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
<<<<<<< HEAD
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const caption = formData.get('caption') as string;
=======
    const formData = await request.formData();
    const file = formData.get('file') as File;
>>>>>>> f9e815a3074bf72ca7c8f7206a627d49d2362fa0

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

<<<<<<< HEAD
    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const extension = file.type.split('/')[1] || 'bin';
    const filename = `${hash}.${extension}`;

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file to public directory
    const path = join(uploadsDir, filename);
    await writeFile(path, buffer);
    const fileUrl = `/uploads/${filename}`;

    // Create post in database
    const post = await prisma.post.create({
      data: {
        imageUrl: fileUrl,
        caption,
        type,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Return the response with the post data
    return NextResponse.json({
      message: 'Post created successfully',
      post: {
        id: post.id,
        type: post.type,
        imageUrl: post.imageUrl,
        caption: post.caption,
        createdAt: post.createdAt,
        author: post.user,
        isLiked: false,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload post';
    return NextResponse.json(
      { error: errorMessage },
=======
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the file
    await writeFile(filePath, buffer);

    // Return the URL that can be accessed publicly
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
>>>>>>> f9e815a3074bf72ca7c8f7206a627d49d2362fa0
      { status: 500 }
    );
  }
} 