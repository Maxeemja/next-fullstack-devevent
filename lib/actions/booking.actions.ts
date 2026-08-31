'use server';
import { Booking } from '@/database';
import { connectToDatabase } from '../mongodb';

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}) => {
  try {
    await connectToDatabase();
    await Booking.create({ eventId, email });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};
