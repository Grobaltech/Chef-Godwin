import { useEffect } from 'react';
import WOW from 'wow.js';
import 'animate.css';
import LeadForm from './components/LeadForm';
import { BRAND, COURSES, EVENT_TYPES, waLink } from './config';

export default function App() {
  useEffect(() => {
    new WOW({ live: false, animateClass: 'animate__animated' }).init();
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-20 bg-leaf text-white"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <a href="#top" className="font-display text-lg font-bold">{BRAND.short}</a>
          <nav className="flex gap-4 text-sm font-semibold">
            <a href="#catering">Catering</a>
            <a href="#school">School</a>
            <a href={waLink('Hello Chef Godwin')} className="text-saffron">WhatsApp</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero: one orchestrated entrance, nothing else on the page auto-animates beyond headings */}
        <section className="bg-leaf text-white">
          <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 sm:pt-20">
            <p className="animate__animated animate__fadeIn text-saffron font-semibold">{BRAND.tagline}</p>
            <h1 className="animate__animated animate__fadeInUp mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
              Food cooked for the days families remember.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Catering for introductions, weddings and private events, and a school where you learn to cook the same way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#catering" className="rounded-md bg-saffron px-5 py-3 font-semibold text-ink">Book catering</a>
              <a href="#school" className="rounded-md border border-white/60 px-5 py-3 font-semibold">Join the school</a>
            </div>
          </div>
        </section>

        <section id="catering" className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="wow animate__fadeInUp text-3xl font-extrabold text-leaf">Catering</h2>
            <p className="mt-3 max-w-md">Tell us about your event and we will confirm menu, pricing and date with you on WhatsApp.</p>
            <ul className="mt-5 grid gap-2">
              {EVENT_TYPES.map((t) => (
                <li key={t} className="border-l-4 border-saffron pl-3">{t}</li>
              ))}
            </ul>
          </div>
          <LeadForm kind="catering" />
        </section>

        <section id="school" className="bg-white">
          <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-2">
            <div>
              <h2 className="wow animate__fadeInUp text-3xl font-extrabold text-leaf">Cooking school</h2>
              <p className="mt-3 max-w-md">Learn professional cooking from Chef Godwin's kitchen. Apply below and the team will share dates and fees.</p>
              <ul className="mt-5 grid gap-2">
                {COURSES.map((c) => (
                  <li key={c} className="border-l-4 border-chili pl-3">{c}</li>
                ))}
              </ul>
            </div>
            <LeadForm kind="school" />
          </div>
        </section>
      </main>

      <footer className="bg-ink text-white/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm">
          <span>{BRAND.name}, {BRAND.location}</span>
          <a href={waLink('Hello Chef Godwin')} className="font-semibold text-saffron">Chat on WhatsApp</a>
        </div>
      </footer>
    </>
  );
}
