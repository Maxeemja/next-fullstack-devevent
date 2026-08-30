import { notFound } from 'next/navigation';
import Image from 'next/image';

const BASE_URL = process.env.BASE_URL;

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
  const { slug } = await params;
  const {
    event: {
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
    },
  } = await fetch(`${BASE_URL}/api/events/${slug}`).then((res) => res.json());

  if (!title) return notFound();

  const bookings = 10;

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
          <p className="text-lg font-semibold">Book event</p>

          <div className="bookings">
            
          </div>
        </aside>
      </div>
    </section>
  );
}

export default EventDetailsPage;
