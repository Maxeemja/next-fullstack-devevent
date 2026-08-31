'use client';
import { createBooking } from '@/lib/actions/booking.actions';
import posthog from 'posthog-js';
import { useState } from 'react';

function BookEvent({ eventId }: { eventId: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success, error } = await createBooking({ eventId, email });

    if (success) {
      setSubmitted(true);
      posthog.capture('event_booked', { eventId, email });
    } else {
      console.error('Booking creation failed', error);
      posthog.captureException(error);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email"
            />
            <button className="mt-2 button-submit" type="submit">
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default BookEvent;
