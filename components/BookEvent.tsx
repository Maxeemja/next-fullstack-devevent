'use client';
import { useState } from 'react';

function BookEvent() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
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
