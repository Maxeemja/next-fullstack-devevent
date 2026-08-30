import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/database';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { slug } = await context.params;

    if (!slug || !slugPattern.test(slug)) {
      return NextResponse.json(
        { message: 'A valid event slug is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Successfully fetched the event!', event },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch event by slug:', error);

    return NextResponse.json(
      { message: 'Unable to fetch event' },
      { status: 500 }
    );
  }
}
