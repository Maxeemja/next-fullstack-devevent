import { connectToDatabase } from '@/lib/mongodb';
import { Event } from '@/database/event.model';

export const getAllEvents = async () => {
  try {
    await connectToDatabase();
    return await Event.find().sort({ createdAt: -1 }).lean();
  } catch {
    return [];
  }
};

export const getEventBySlug = async (slug: string) => {
  try {
    await connectToDatabase();
    return await Event.findOne({ slug }).lean();
  } catch {
    return null;
  }
};

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    if (!event) return [];

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch {
    return [];
  }
};
