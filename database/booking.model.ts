import {
  Schema,
  Types,
  model,
  models,
  type HydratedDocument,
  type Model,
  type Query,
  type UpdateQuery,
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

bookingSchema.pre<Query<unknown, Booking>>(
  'updateOne',
  async function (): Promise<void> {
    const update = this.getUpdate();

    if (Array.isArray(update)) {
      throw new Error('Booking update pipelines are not supported');
    }

    this.setOptions({ runValidators: true });

    if (!update) {
      return;
    }

    const bookingUpdate = update as UpdateQuery<Booking>;
    const updateTargets = [
      bookingUpdate,
      bookingUpdate.$set,
      bookingUpdate.$setOnInsert,
    ];

    for (const fields of updateTargets) {
      if (!fields || fields.eventId === undefined) {
        continue;
      }

      const eventExists = await Event.exists({ _id: fields.eventId });

      if (!eventExists) {
        throw new Error(`Event ${fields.eventId.toString()} does not exist`);
      }
    }
  }
);

export const Booking: BookingModel =
  (models.Booking as BookingModel | undefined) ??
  model<Booking>('Booking', bookingSchema);
