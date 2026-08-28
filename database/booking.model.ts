import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from 'mongoose';
import { Event } from './event.model';

export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<Booking>;
export type BookingModel = Model<Booking>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<Booking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: emailPattern,
    },
  },
  { timestamps: true }
);

bookingSchema.pre(
  'save',
  async function (this: BookingDocument): Promise<void> {
    // Check the reference before saving so bookings cannot target missing events.
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error(`Event ${this.eventId.toString()} does not exist`);
    }
  }
);

export const Booking: BookingModel =
  (models.Booking as BookingModel | undefined) ??
  model<Booking>('Booking', bookingSchema);
