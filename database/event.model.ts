import { HydratedDocument, Model, Schema, model, models } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;
export type EventModel = Model<IEvent>;

const nonEmptyString = (value: string): boolean => value.trim().length > 0;

const slugify = (title: string): string =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Event date must be a valid date');
  }

  return date.toISOString().slice(0, 10);
};

const normalizeTime = (value: string): string => {
  const trimmedValue = value.trim();
  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmedValue);
  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(trimmedValue);

  if (twelveHourMatch) {
    const hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

    if (hour < 1 || hour > 12 || minute > 59) {
      throw new Error('Event time must be a valid time');
    }

    const normalizedHour = (hour % 12) + (period === 'PM' ? 12 : 0);
    return `${String(normalizedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (hour > 23 || minute > 59) {
      throw new Error('Event time must be a valid time');
    }

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  throw new Error('Event time must use a 24-hour or 12-hour format');
};

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, validate: nonEmptyString },
    slug: { type: String, unique: true, default: '' },
    description: { type: String, required: true, validate: nonEmptyString },
    overview: { type: String, required: true, validate: nonEmptyString },
    image: { type: String, required: true, validate: nonEmptyString },
    venue: { type: String, required: true, validate: nonEmptyString },
    location: { type: String, required: true, validate: nonEmptyString },
    date: { type: String, required: true, validate: nonEmptyString },
    time: { type: String, required: true, validate: nonEmptyString },
    mode: { type: String, required: true, validate: nonEmptyString },
    audience: { type: String, required: true, validate: nonEmptyString },
    agenda: {
      type: [String],
      required: true,
      validate: (value: string[]) => value.length > 0,
    },
    organizer: { type: String, required: true, validate: nonEmptyString },
    tags: {
      type: [String],
      required: true,
      validate: (value: string[]) => value.length > 0,
    },
  },
  { timestamps: true }
);

eventSchema.pre('save', function (this: EventDocument): void {
  // Rebuild the slug only when its source title has changed.
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title);
  }

  if (!this.slug) {
    throw new Error('Event title must produce a valid slug');
  }

  // Store dates as ISO calendar dates and times as 24-hour HH:mm values.
  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
});

export const Event: EventModel =
  (models.Event as EventModel | undefined) ??
  model<IEvent>('Event', eventSchema);
