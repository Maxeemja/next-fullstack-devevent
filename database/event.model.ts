import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
  type Query,
  type UpdateQuery,
} from 'mongoose';

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
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error('Event date must be a valid date');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);

  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
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

eventSchema.pre('insertMany', function (docs: IEvent | IEvent[]): void {
  for (const event of Array.isArray(docs) ? docs : [docs]) {
    event.slug = slugify(event.title);

    if (!event.slug) {
      throw new Error('Event title must produce a valid slug');
    }

    event.date = normalizeDate(event.date);
    event.time = normalizeTime(event.time);
  }
});

eventSchema.pre<Query<unknown, IEvent>>('updateOne', function (): void {
  const update = this.getUpdate();

  if (Array.isArray(update)) {
    throw new Error('Event update pipelines are not supported');
  }

  this.setOptions({ runValidators: true });

  if (!update) {
    return;
  }

  const eventUpdate = update as UpdateQuery<IEvent>;
  const updateTargets = [
    eventUpdate,
    eventUpdate.$set,
    eventUpdate.$setOnInsert,
  ];

  for (const fields of updateTargets) {
    if (!fields) {
      continue;
    }

    if (fields.title !== undefined) {
      fields.slug = slugify(fields.title);

      if (!fields.slug) {
        throw new Error('Event title must produce a valid slug');
      }
    } else if (
      fields.slug !== undefined &&
      (typeof fields.slug !== 'string' || !fields.slug)
    ) {
      throw new Error('Event title must produce a valid slug');
    }

    if (fields.date !== undefined) {
      fields.date = normalizeDate(fields.date);
    }

    if (fields.time !== undefined) {
      fields.time = normalizeTime(fields.time);
    }
  }

  this.setUpdate(eventUpdate);
});

export const Event: EventModel =
  (models.Event as EventModel | undefined) ??
  model<IEvent>('Event', eventSchema);
