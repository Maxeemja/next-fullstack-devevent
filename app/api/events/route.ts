import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { Event } from '@/database';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const formData = await req.formData();
    const event = Object.fromEntries(formData.entries()) as Record<
      string,
      FormDataEntryValue
    >;

    for (const field of ['agenda', 'tags']) {
      const value = event[field];

      if (typeof value === 'string') {
        try {
          const parsedValue: unknown = JSON.parse(value);

          if (
            !Array.isArray(parsedValue) ||
            !parsedValue.every(
              (item): item is string => typeof item === 'string'
            )
          ) {
            return NextResponse.json(
              { message: `${field} must be a JSON array of strings` },
              { status: 400 }
            );
          }

          event[field] = parsedValue.join('\u0000');
        } catch {
          return NextResponse.json(
            { message: `${field} must be valid JSON` },
            { status: 400 }
          );
        }
      }
    }

    const file = formData.get('image') as File;

    if (!file)
      return NextResponse.json(
        { message: 'Image is required' },
        { status: 400 }
      );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'DevEvent',
          },
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const eventData = {
      ...event,
      agenda:
        typeof event.agenda === 'string' ? event.agenda.split('\u0000') : [],
      tags: typeof event.tags === 'string' ? event.tags.split('\u0000') : [],
    };

    const createdEvent = await Event.create(eventData);
    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: createdEvent,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: 'Event creation failed',
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { message: 'Events fetched successfully', events },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Event fetching error', error },
      { status: 500 }
    );
  }
}
