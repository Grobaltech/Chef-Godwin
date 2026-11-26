import { useState } from 'react';
import Turnstile from './Turnstile';
import { API_BASE, EVENT_TYPES, COURSES, TURNSTILE_SITE_KEY, waLink } from '../config';

const FIELDS = {
  catering: [
    { name: 'name', label: 'Your name', required: true },
    { name: 'phone', label: 'Phone or WhatsApp number', type: 'tel', required: true },
    { name: 'email', label: 'Email address', type: 'email' },
    { name: 'event_type', label: 'Event type', type: 'select', options: EVENT_TYPES, required: true },
    { name: 'event_date', label: 'Event date', type: 'date' },
    { name: 'venue', label: 'Venue or area' },
    { name: 'guests', label: 'Number of guests', type: 'number' },
    { name: 'message', label: 'Anything else we should know?', type: 'textarea' }
  ],
  school: [
    { name: 'name', label: 'Your name', required: true },
    { name: 'phone', label: 'Phone or WhatsApp number', type: 'tel', required: true },
    { name: 'email', label: 'Email address', type: 'email' },
    { name: 'course', label: 'Course', type: 'select', options: COURSES, required: true },
    { name: 'intake', label: 'Preferred start date' },
    { name: 'message', label: 'Tell us about your cooking experience', type: 'textarea' }
  ]
};

const COPY = {
  catering: { button: 'Send booking request', intro: 'Catering enquiry' },
  school: { button: 'Send application', intro: 'Cooking school application' }
};

const inputClass =
  'w-full rounded-md border border-ink/25 bg-white px-3 py-2.5 text-base focus:border-leaf focus:outline-none';

export default function LeadForm({ kind }) {
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [summary, setSummary] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (TURNSTILE_SITE_KEY && !token) {
      setError('Please wait for the security check to finish, then try again.');
      return;
    }
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    const honeypot = data.website || '';
    delete data.website;

    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, data, website: honeypot, turnstileToken: token })
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');

      const lines = FIELDS[kind]
        .filter((f) => data[f.name])
        .map((f) => `${f.label}: ${data[f.name]}`);
      setSummary(`Hello Chef Godwin, ${COPY[kind].intro}.\n${lines.join('\n')}`);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again or message us on WhatsApp.');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-lg border border-leaf/30 bg-white p-5" role="status">
        <p className="font-display text-xl font-bold text-leaf">We received your request.</p>
        <p className="mt-2">Finish on WhatsApp so the team can confirm details with you.</p>
        <a
          href={waLink(summary)}
          className="mt-4 inline-block rounded-md bg-leaf px-5 py-3 font-semibold text-white"
        >
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {FIELDS[kind].map((f) => (
        <label key={f.name} className="grid gap-1 text-sm font-semibold">
          {f.label}
          {f.type === 'textarea' ? (
            <textarea name={f.name} rows={3} className={inputClass} />
          ) : f.type === 'select' ? (
            <select name={f.name} required={f.required} defaultValue="" className={inputClass}>
              <option value="" disabled>Choose one</option>
              {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              name={f.name}
              type={f.type || 'text'}
              required={f.required}
              min={f.type === 'number' ? 1 : undefined}
              inputMode={f.type === 'tel' ? 'tel' : undefined}
              className={inputClass}
            />
          )}
        </label>
      ))}

      {/* Honeypot: hidden from people, bots fill it in */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <Turnstile onToken={setToken} />

      {error && <p className="text-sm font-semibold text-chili" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-md bg-chili px-5 py-3 text-base font-semibold text-white disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : COPY[kind].button}
      </button>
    </form>
  );
}
