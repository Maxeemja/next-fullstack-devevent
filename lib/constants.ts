// Application constants

export interface Event {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: Event[] = [
  {
    title: 'React Conference 2025',
    image: '/images/event1.png',
    slug: 'react-conference-2025',
    location: 'San Francisco, CA',
    date: '2025-05-14',
    time: '9:00 AM',
  },
  {
    title: 'Next.js Summit',
    image: '/images/event2.png',
    slug: 'nextjs-summit-2025',
    location: 'New York, NY',
    date: '2025-06-24',
    time: '10:00 AM',
  },
  {
    title: 'TypeScript World Congress',
    image: '/images/event3.png',
    slug: 'typescript-world-congress',
    location: 'Berlin, Germany',
    date: '2025-07-08',
    time: '9:30 AM',
  },
  {
    title: 'Web Development Expo',
    image: '/images/event4.png',
    slug: 'web-dev-expo-2025',
    location: 'Austin, TX',
    date: '2025-08-19',
    time: '8:00 AM',
  },
  {
    title: 'JavaScript Global Hackathon',
    image: '/images/event5.png',
    slug: 'js-global-hackathon',
    location: 'Virtual',
    date: '2025-09-01',
    time: '12:00 PM',
  },
  {
    title: 'Full Stack Developer Summit',
    image: '/images/event6.png',
    slug: 'fullstack-developer-summit',
    location: 'Seattle, WA',
    date: '2025-10-15',
    time: '9:00 AM',
  },
];
