import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';
import { IEvent } from '@/database/event.model';
import { getAllEvents } from '@/lib/actions/event.actions';
import { cacheLife } from 'next/cache';

const RootPage = async () => {
  'use cache';
  cacheLife('hours');

  const events = await getAllEvents();

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
                <EventCard
                  title={event.title}
                  image={event.image}
                  slug={event.slug}
                  location={event.location}
                  date={event.date}
                  time={event.time}
                />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};
export default RootPage;
