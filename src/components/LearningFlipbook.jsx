import { forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';

const BookPage = forwardRef(function BookPage({ children, className = '' }, ref) {
  return <div ref={ref} className={`flex h-full flex-col overflow-hidden border border-stone-200 bg-[#fffdf5] p-6 ${className}`}>{children}</div>;
});

export default function LearningFlipbook({ courses = [] }) {
  const pages = [
    { title: 'Welcome to the kitchen', body: 'Chef Godwin Culinary School', note: 'Practical skills. Confidence. Creativity.' },
    { title: 'Learn by doing', body: 'Build real kitchen confidence through practical lessons, guided preparation and an understanding of ingredients, hygiene and technique.', note: 'A learning journey designed around the kitchen.' },
    ...courses.map(course => ({
      title: course.title,
      body: course.summary || 'Explore this practical cooking course.',
      note: [course.duration_label, course.fee != null ? `${new Intl.NumberFormat('en-UG').format(course.fee)} ${course.currency || 'UGX'}` : null].filter(Boolean).join(' · ')
    }))
  ];
  return <section className="mt-8 rounded-3xl bg-leaf p-5 text-white sm:p-7">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-extrabold uppercase tracking-widest text-saffron">Flip-through guide</p><h3 className="mt-2 text-2xl font-extrabold">Explore the school and courses.</h3></div>
      <p className="text-xs text-white/65">Swipe or drag a page to turn</p>
    </div>
    <div className="flex justify-center overflow-hidden">
      <HTMLFlipBook width={280} height={360} size="stretch" minWidth={250} maxWidth={420} minHeight={320} maxHeight={500} maxShadowOpacity={0.22} showCover mobileScrollSupport className="mx-auto">
        {pages.map((page, index) => <BookPage key={`${page.title}-${index}`}>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A52A2A]">{index === 0 ? 'Chef Godwin' : `School guide · ${index}`}</p>
          <div className="my-auto">
            <h4 className="text-2xl font-extrabold leading-tight text-[#0B3B2E]">{page.title}</h4>
            <p className="mt-4 text-sm leading-6 text-stone-600">{page.body}</p>
          </div>
          {page.note && <p className="border-t border-stone-200 pt-3 text-xs font-bold text-[#A52A2A]">{page.note}</p>}
          <p className="mt-3 text-right text-[10px] text-stone-400">{index + 1} / {pages.length}</p>
        </BookPage>)}
      </HTMLFlipBook>
    </div>
  </section>;
}
