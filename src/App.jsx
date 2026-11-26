import { useEffect, useState } from 'react';
import WOW from 'wow.js';
import { gsap } from 'gsap';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'animate.css';
import LeadForm from './components/LeadForm';
import AdminDashboard from './components/AdminDashboard';
import { BRAND, COURSES, EVENT_TYPES, waLink } from './config';
import { supabase, supabaseConfigured } from './lib/supabase';

function Login({ onBack }) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    const result=await supabase.auth.signInWithPassword({email:email.trim(),password});
    if(result.error)setError(result.error.message);
    setBusy(false);
  }
  return <main className="flex min-h-screen items-center justify-center bg-leaf px-4 py-12"><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
    <a href="/" onClick={onBack} className="text-xs font-extrabold uppercase tracking-widest text-chili">← Chef Godwin</a>
    <p className="mt-8 text-xs font-bold uppercase tracking-widest text-saffron">Private staff access</p><h1 className="mt-2 text-3xl font-extrabold text-leaf">Welcome back.</h1>
    <p className="mt-2 text-sm text-stone-500">Sign in with an account invited to the Chef Godwin team. Public registration is disabled.</p>
    {!supabaseConfigured&&<p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">Missing frontend settings. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to Cloudflare build variables and redeploy.</p>}
    <form onSubmit={submit} className="mt-7 grid gap-4">
      <label className="grid gap-1 text-sm font-bold">Email<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="rounded-xl border border-stone-200 px-4 py-3 font-normal"/></label>
      <label className="grid gap-1 text-sm font-bold">Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="rounded-xl border border-stone-200 px-4 py-3 font-normal"/></label>
      {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy||!supabaseConfigured} className="mt-2 rounded-xl bg-chili px-5 py-3 font-extrabold text-white disabled:opacity-60">{busy?'Signing in…':'Sign in securely'}</button>
    </form><p className="mt-6 text-xs leading-5 text-stone-400">Access is granted by the Super Administrator. Contact the administrator if you need an account.</p>
  </div></main>;
}

function PublicSite({ onAdmin }) {
  const [site,setSite]=useState(null),[services,setServices]=useState([]),[courses,setCourses]=useState([]),[menu,setMenu]=useState([]),[quotes,setQuotes]=useState([]),[gallery,setGallery]=useState([]);
  useEffect(()=>{
    const root=document.querySelector('.hero-copy');
    if(!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const context=gsap.context(()=>{
      gsap.fromTo('.hero-copy > *',{y:24,opacity:0},{y:0,opacity:1,duration:0.75,stagger:0.12,ease:'power3.out'});
      gsap.fromTo('.hero-visual',{y:18,opacity:0,scale:0.98},{y:0,opacity:1,scale:1,duration:1,ease:'power2.out',delay:0.25});
    },root.parentElement);
    return()=>context.revert();
  },[]);
  useEffect(()=>{
    if(!supabase)return;
    let alive=true;
    Promise.all([
      supabase.from('site_settings').select('*').eq('id',true).maybeSingle(),
      supabase.from('services').select('id,title,summary,price_label').eq('status','published').order('sort_order'),
      supabase.from('courses').select('id,title,summary,duration_label,fee,currency').eq('status','published').order('sort_order'),
      supabase.from('menu_items').select('id,name,description,image_url,price,currency').eq('status','published').eq('is_available',true).order('sort_order').limit(6),
      supabase.from('testimonials').select('id,customer_name,customer_title,quote').eq('status','published').order('created_at',{ascending:false}).limit(6),
      supabase.from('gallery_items').select('id,title,description,media_url,media_type,alt_text,category').eq('status','published').order('sort_order').limit(12)
    ]).then(([settings,srv,crs,mnu,feedback,photos])=>{
      if(!alive)return;
      setSite(settings.data);setServices(srv.data||[]);setCourses(crs.data||[]);setMenu(mnu.data||[]);setQuotes(feedback.data||[]);setGallery(photos.data||[]);
    });
    return()=>{alive=false};
  },[]);
  const name=site?.business_name||BRAND.name;
  const contact=(text)=>site?.whatsapp_number?'https://wa.me/'+String(site.whatsapp_number).replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(text):waLink(text);
  const shownServices=services.length?services:EVENT_TYPES.map(title=>({id:title,title,summary:'Made with care for your special gathering.'}));
  const shownCourses=courses.length?courses:COURSES.map(title=>({id:title,title,summary:'Practical, hands-on cooking lessons.'}));
  return <>
    <header className="sticky top-0 z-20 bg-leaf text-white shadow-md" style={{paddingTop:'env(safe-area-inset-top, 0px)'}}><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <a href="#top" className="flex items-center gap-3"><img src="/logo.jpg" alt="Chef Godwin emblem" className="h-12 w-10 rounded-sm object-contain"/><span className="font-display text-lg font-extrabold">Chef Godwin</span></a>
      <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm"><a href="#catering">Catering</a><a href="#school">School</a>{menu.length>0&&<a href="#menu">Menu</a>}<a href={contact('Hello Chef Godwin')} className="rounded-lg bg-saffron px-3 py-2 text-ink">WhatsApp</a></nav>
    </div></header>
    <main id="top">
      <section className="relative overflow-hidden bg-leaf text-white"><div className="absolute -right-24 -top-28 h-96 w-96 rounded-full border-[45px] border-white/5"/><div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:py-28 lg:grid-cols-[1.15fr_.85fr]">
        <div className="hero-copy relative z-10"><p className="text-sm font-bold uppercase tracking-widest text-saffron">{site?.tagline||BRAND.tagline}</p><h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-tight sm:text-7xl">Food made for moments that matter.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/75">Thoughtful catering for introductions, weddings and celebrations, alongside practical cooking lessons for the next generation of great cooks.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#catering" className="rounded-xl bg-saffron px-6 py-3.5 font-extrabold text-ink">Plan your event</a><a href="#school" className="rounded-xl border border-white/30 px-6 py-3.5 font-bold">Explore the school</a></div></div>
        <div className="hero-visual relative"><div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-white/10 shadow-2xl"><img src="/hero-food.jpg" alt="Chef Godwin prepared food" className="h-full w-full object-cover" onError={e=>{e.currentTarget.style.display='none'}}/></div><div className="absolute -bottom-5 -left-5 rounded-2xl bg-saffron p-5 text-ink shadow-xl"><p className="text-xs font-bold uppercase">Our promise</p><p className="mt-1 text-xl font-extrabold">Every plate tells a story.</p></div></div>
      </div></section>
      <section id="catering" className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2"><div><p className="text-xs font-extrabold uppercase tracking-widest text-chili">Gather beautifully</p><h2 className="mt-3 text-4xl font-extrabold text-leaf">Catering for your big moments.</h2><p className="mt-5 max-w-lg leading-7 text-stone-600">From traditional introductions and weddings to private celebrations and corporate occasions, tell us what you are planning. Our team will help shape the menu and details.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{shownServices.map(item=><div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4"><h3 className="font-extrabold text-leaf">{item.title}</h3><p className="mt-1 text-sm text-stone-500">{item.summary}</p>{item.price_label&&<p className="mt-2 text-sm font-bold text-chili">{item.price_label}</p>}</div>)}</div></div><div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-stone-200 sm:p-8"><h3 className="mb-5 text-2xl font-extrabold text-leaf">Tell us about your event</h3><LeadForm kind="catering" eventTypes={EVENT_TYPES}/></div></section>
      <section id="school" className="bg-[#f1eee4] py-20"><div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2"><div><p className="text-xs font-extrabold uppercase tracking-widest text-chili">Learn the craft</p><h2 className="mt-3 text-4xl font-extrabold text-leaf">A cooking school built around real kitchen skills.</h2><p className="mt-5 max-w-lg leading-7 text-stone-600">Build confidence, learn technique and understand how to prepare food for people. Explore the current courses and send an application.</p><div className="mt-7 grid gap-3">{shownCourses.map(course=><div key={course.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="font-extrabold text-leaf">{course.title}</h3>{course.duration_label&&<span className="shrink-0 rounded-full bg-saffron/20 px-3 py-1 text-xs font-bold">{course.duration_label}</span>}</div><p className="mt-2 text-sm text-stone-500">{course.summary}</p>{course.fee!=null&&<p className="mt-3 font-bold text-chili">{new Intl.NumberFormat('en-UG').format(course.fee)} {course.currency||'UGX'}</p>}</div>)}</div></div><div className="rounded-3xl bg-white p-5 shadow-xl sm:p-8"><h3 className="mb-5 text-2xl font-extrabold text-leaf">Apply to the cooking school</h3><LeadForm kind="school" courses={shownCourses}/></div></div></section>
      {menu.length>0&&<section id="menu" className="mx-auto max-w-6xl px-4 py-20"><p className="text-xs font-extrabold uppercase tracking-widest text-chili">From our kitchen</p><h2 className="mt-3 text-4xl font-extrabold text-leaf">A taste of the menu.</h2><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{menu.map(item=><article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">{item.image_url&&<img src={item.image_url} alt={item.name} className="h-48 w-full object-cover"/>}<div className="p-5"><h3 className="font-extrabold">{item.name}</h3><p className="mt-2 text-sm text-stone-500">{item.description}</p>{item.price!=null&&<p className="mt-3 font-bold text-chili">{new Intl.NumberFormat('en-UG').format(item.price)} {item.currency||'UGX'}</p>}</div></article>)}</div></section>}
      {gallery.length>0&&<section className="mx-auto max-w-6xl px-4 py-20"><p className="text-xs font-extrabold uppercase tracking-widest text-chili">A look inside</p><h2 className="mt-3 text-4xl font-extrabold text-leaf">Moments from our kitchen.</h2><Swiper className="mt-8" spaceBetween={16} slidesPerView={1.12} breakpoints={{640:{slidesPerView:2},1024:{slidesPerView:3}}} grabCursor>{gallery.map(item=><SwiperSlide key={item.id}><article className="h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">{item.media_type==='video'?<video src={item.media_url} controls className="h-56 w-full object-cover"/>:<img src={item.media_url} alt={item.alt_text||item.title||'Chef Godwin gallery'} loading="lazy" className="h-56 w-full object-cover"/>}<div className="p-4"><h3 className="font-extrabold text-leaf">{item.title}</h3><p className="mt-1 text-sm text-stone-500">{item.description}</p></div></article></SwiperSlide>)}</Swiper></section>}
      {quotes.length>0&&<section className="bg-leaf py-20 text-white"><div className="mx-auto max-w-6xl px-4"><p className="text-xs font-extrabold uppercase tracking-widest text-saffron">Kind words</p><h2 className="mt-3 text-4xl font-extrabold">What our customers say.</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{quotes.map(item=><blockquote key={item.id} className="rounded-2xl bg-white/10 p-6"><p className="text-lg leading-7">“{item.quote}”</p><footer className="mt-5 text-sm font-bold text-saffron">{item.customer_name}{item.customer_title?', '+item.customer_title:''}</footer></blockquote>)}</div></div></section>}
    </main>
    <footer className="bg-ink text-white/75"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-9 text-sm"><div><p className="font-extrabold text-white">{name}</p><p className="mt-1">{site?.physical_address||BRAND.location}</p></div><div className="flex items-center gap-4"><a href={contact('Hello Chef Godwin')} className="font-bold text-saffron">Chat on WhatsApp</a><button onClick={onAdmin} className="text-xs text-white/50 hover:text-white">Staff login</button></div></div></footer>
  </>;
}

export default function App(){
  const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[authLoading,setAuthLoading]=useState(true),[showLogin,setShowLogin]=useState(window.location.pathname.startsWith('/admin')||window.location.pathname.startsWith('/login')),[profileError,setProfileError]=useState('');
  useEffect(()=>{
    new WOW({live:false,animateClass:'animate__animated'}).init();
    if(!supabase){setAuthLoading(false);return}
    let alive=true;
    supabase.auth.getSession().then(({data})=>{if(alive)setSession(data.session);setAuthLoading(false)});
    const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);if(!next)setProfile(null)});
    return()=>{alive=false;listener.subscription.unsubscribe()}
  },[]);
  useEffect(()=>{
    let alive=true;
    async function getProfile(){
      if(!session?.user){setProfile(null);setProfileError('');return}
      const {data,error}=await supabase.from('staff_profiles').select('id,full_name,role,is_active').eq('id',session.user.id).maybeSingle();
      if(!alive)return;
      if(error)setProfileError(error.message);
      else if(!data||!data.is_active)setProfileError('This account does not have active staff access. Contact the Super Administrator.');
      else{setProfile(data);setProfileError('')}
    }
    getProfile();return()=>{alive=false}
  },[session]);
  async function signOut(){await supabase.auth.signOut();setShowLogin(false);window.history.replaceState({},'','/')}
  if(session&&(authLoading||(!profile&&!profileError)))return <div className="flex min-h-screen items-center justify-center bg-cream text-leaf">Checking your staff access…</div>;
  if(session&&profile)return <AdminDashboard user={session.user} profile={profile} onSignOut={signOut}/>;
  if(session&&profileError)return <main className="flex min-h-screen items-center justify-center bg-cream px-4"><div className="max-w-md rounded-2xl bg-white p-8 shadow"><h1 className="text-2xl font-extrabold text-leaf">Access not available</h1><p className="mt-3 text-sm text-stone-600">{profileError}</p><button onClick={signOut} className="mt-6 rounded-lg bg-chili px-4 py-2 font-bold text-white">Sign out</button></div></main>;
  if(showLogin)return <Login onBack={()=>setShowLogin(false)}/>;
  if(authLoading)return <div className="flex min-h-screen items-center justify-center bg-cream text-leaf">Loading Chef Godwin…</div>;
  return <PublicSite onAdmin={()=>{setShowLogin(true);window.history.pushState({},'','/login')}}/>;
}
