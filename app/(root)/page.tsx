import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';
import { IEvent } from '@/database/event.model';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.BASE_URL;

const RootPage = async () => {
  if (!BASE_URL) {
    throw new Error('Missing BASE_URL environment variable');
  }

  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();
  console.log('events', events);
  return (
    <section>
      <h1 className="text-center">
        The Hub for every Dev <br /> Event you can&#39;t miss!
      </h1>
      <p className="text-center mt-5">
        Hackathons, meetups and conferences. All in One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured events</h3>

        <ul className="events">
          {events &&
            events.length &&
            events.map((event: IEvent) => (
              <li key={event.title}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};
export default RootPage;
