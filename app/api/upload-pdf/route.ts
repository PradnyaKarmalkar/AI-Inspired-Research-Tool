import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json(
        { error: 'No file or filename provided' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to prevent overwrites
    const uniqueFilename = `${Date.now()}-${filename}`;
    const uploadPath = join(process.cwd(), 'uploads', 'report_uploads', uniqueFilename);

    // Write the file to the uploads directory
    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename: uniqueFilename,
      path: uploadPath,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 