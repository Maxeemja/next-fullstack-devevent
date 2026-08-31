import { notFound } from 'next/navigation';
import Image from 'next/image';
import BookEvent from '@/components/BookEvent';
import {
  getSimilarEventsBySlug,
  getEventBySlug,
  getAllEvents,
} from '@/lib/actions/event.actions';
import { IEvent } from '@/database/event.model';
import EventCard from '@/components/EventCard';
import { cacheLife } from 'next/cache';

export async function generateStaticParams() {
  const events = await getAllEvents();
  const params = events.map((event) => ({ slug: event.slug }));

  if (params.length === 0) {
    return [{ slug: 'placeholder' }];
  }

  return params;
}

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => {
  return (
    <div className="flex-row-gap-2 items-center">
      <Image src={icon} alt={alt} width={17} height={17} />
      <p className="">{label}</p>
    </div>
  );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.map((t) => (
        <div className="pill" key={t}>
          {t}
        </div>
      ))}
    </div>
  );
};

async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  'use cache';
  cacheLife('hours');

  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return notFound();

  const {
    description,
    title,
    date,
    time,
    location,
    agenda,
    image,
    mode,
    overview,
    audience,
    organizer,
    tags,
  } = event;

  if (!title) return notFound();

  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
      <div className="details">
        <div className="content">
          <Image
            src={image}
            alt="event-image"
            width={800}
            height={800}
            className="banner"
          />
          <section className="event">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>

            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>
        <aside className="booking">
          <div className="signup-card">
            <h2>Book your spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who already booked their spot!
              </p>
            ) : (
              <p className="text-sm">Be the first to book!</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events:</h2>
        <div className="events">
          {similarEvents.length ? (
            similarEvents.map((similarEvent) => (
              <EventCard
                key={similarEvent.title}
                title={similarEvent.title}
                image={similarEvent.image}
                slug={similarEvent.slug}
                location={similarEvent.location}
                date={similarEvent.date}
                time={similarEvent.time}
              />
            ))
          ) : (
            <p>No similar events found.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default EventDetailsPage;
