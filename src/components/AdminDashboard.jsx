import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const MODULES = [
  { key: 'overview', label: 'Overview', icon: '⌂' },
  { key: 'leads', label: 'Leads', table: 'leads', icon: '◎' },
  { key: 'catering_bookings', label: 'Catering bookings', table: 'catering_bookings', icon: '♨' },
  { key: 'school_applications', label: 'School applications', table: 'school_applications', icon: '▤' },
  { key: 'customers', label: 'Customers', table: 'customers', icon: '♙' },
  { key: 'crm_activities', label: 'Follow-ups', table: 'crm_activities', icon: '◷' },
  { key: 'events', label: 'Events', table: 'events', icon: '✦' },
  { key: 'payments', label: 'Payments', table: 'payments', icon: '＄' },
  { key: 'content_pages', label: 'Pages', table: 'content_pages', icon: '▧' },
  { key: 'services', label: 'Services', table: 'services', icon: '✧' },
  { key: 'courses', label: 'Courses', table: 'courses', icon: '♜' },
  { key: 'menu_items', label: 'Menu', table: 'menu_items', icon: '☷' },
  { key: 'gallery_items', label: 'Hero & gallery', table: 'gallery_items', icon: '▣' },
  { key: 'testimonials', label: 'Testimonials', table: 'testimonials', icon: '❞' },
  { key: 'staff_profiles', label: 'Staff & access', table: 'staff_profiles', icon: '♧' },
  { key: 'site_settings', label: 'Website settings', table: 'site_settings', icon: '⚙' }
];

const TITLES = {
  leads: 'Lead pipeline',
  catering_bookings: 'Catering bookings',
  school_applications: 'Cooking school applications',
  customers: 'Customer directory',
  crm_activities: 'Follow-up activities',
  events: 'Events calendar',
  payments: 'Payments',
  content_pages: 'Website pages',
  services: 'Catering services',
  courses: 'Cooking courses',
  menu_items: 'Food menu',
  gallery_items: 'Homepage hero & photo gallery',
  testimonials: 'Customer testimonials',
  staff_profiles: 'Staff and role access',
  site_settings: 'Website settings'
};

const FIELD_LABELS = {
  full_name: 'Full name', name: 'Name', phone: 'Phone', email: 'Email',
  interest: 'Interest', source: 'Source', status: 'Status', notes: 'Notes',
  title: 'Title', slug: 'URL slug', summary: 'Summary', excerpt: 'Excerpt',
  event_type: 'Event type', event_date: 'Event date', venue: 'Venue',
  guests: 'Guests', course: 'Course', intake: 'Intake', amount: 'Amount',
  currency: 'Currency', payment_method: 'Payment method', reference: 'Reference',
  activity_type: 'Activity type', subject: 'Subject', details: 'Details',
  outcome: 'Outcome', next_action_at: 'Next follow-up', starts_at: 'Starts',
  ends_at: 'Ends', role: 'Role', is_active: 'Active', is_featured: 'Featured',
  description: 'Description', image_url: 'Image URL', cover_image_url: 'Cover image URL',
  media_url: 'Media URL', price_label: 'Price label', fee: 'Course fee',
  duration_label: 'Duration', level: 'Level', quote: 'Testimonial',
  customer_name: 'Customer name', customer_title: 'Customer title',
  business_name: 'Business name', tagline: 'Tagline', whatsapp_number: 'WhatsApp number',
  physical_address: 'Address', email_address: 'Email', sort_order: 'Display order'
};

const VISIBLE_FIELDS = {
  leads: ['full_name', 'phone', 'email', 'interest', 'source', 'status', 'next_follow_up_at'],
  catering_bookings: ['name', 'phone', 'event_type', 'event_date', 'venue', 'guests', 'status', 'quoted_amount', 'final_amount'],
  school_applications: ['name', 'phone', 'course', 'intake', 'status'],
  customers: ['full_name', 'phone', 'email', 'source'],
  crm_activities: ['activity_type', 'subject', 'details', 'outcome', 'next_action_at'],
  events: ['title', 'event_type', 'venue', 'starts_at', 'status'],
  payments: ['amount', 'currency', 'payment_method', 'reference', 'status', 'paid_at'],
  content_pages: ['title', 'slug', 'excerpt', 'status', 'updated_at'],
  services: ['title', 'slug', 'summary', 'price_label', 'status'],
  courses: ['title', 'slug', 'duration_label', 'fee', 'status'],
  menu_items: ['name', 'price', 'currency', 'is_available', 'status'],
  gallery_items: ['title', 'category', 'media_type', 'sort_order', 'status'], 
  testimonials: ['customer_name', 'quote', 'rating', 'status'],
  staff_profiles: ['full_name', 'phone', 'role', 'is_active'],
  site_settings: ['business_name', 'tagline', 'phone', 'whatsapp_number', 'email', 'physical_address']
};

const STATUS_OPTIONS = {
  leads: ['new', 'contacted', 'qualified', 'converted', 'lost'],
  catering_bookings: ['new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'],
  school_applications: ['new', 'contacted', 'reviewing', 'accepted', 'enrolled', 'rejected'],
  events: ['planned', 'confirmed', 'completed', 'cancelled'],
  payments: ['pending', 'paid', 'failed', 'refunded'],
  content_pages: ['draft', 'published', 'archived'],
  services: ['draft', 'published', 'archived'],
  courses: ['draft', 'published', 'archived'],
  menu_items: ['draft', 'published', 'archived'],
  gallery_items: ['draft', 'published', 'archived'],
  testimonials: ['pending', 'published', 'hidden']
};

const money = (value, currency = 'UGX') => value == null ? '—' : new Intl.NumberFormat('en-UG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value));

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

function validateGalleryImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Choose a JPEG, PNG, WebP, AVIF or GIF image.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('This image is larger than 25 MB. Please choose a smaller original file.');
}

async function uploadGalleryImage(file) {
  validateGalleryImage(file);
  const extension = file.name.split('.').pop()?.toLowerCase() || 'img';
  const path = `gallery/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('chef-godwin-media').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false
  });
  if (error) throw error;
  return supabase.storage.from('chef-godwin-media').getPublicUrl(path).data.publicUrl;
}
const date = value => value ? new Date(value).toLocaleString() : '—';

const ROLE_MODULES = {
  manager: ['overview','leads','catering_bookings','school_applications','customers','crm_activities','events','payments','content_pages','services','courses','menu_items','gallery_items','testimonials','site_settings'],
  content_editor: ['overview','content_pages','services','courses','menu_items','gallery_items','testimonials','site_settings'],
  chef: ['overview','menu_items'],
  events: ['overview','leads','catering_bookings','customers','crm_activities','events'],
  admissions: ['overview','leads','school_applications','customers','crm_activities','courses'],
  finance: ['overview','catering_bookings','school_applications','customers','crm_activities','payments'],
  receptionist: ['overview','leads','catering_bookings','school_applications','customers','crm_activities','events']
};

function Metric({ label, value, detail, tone = '' }) {
  return <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-semibold text-stone-500">{label}</p>
    <p className={`mt-2 text-3xl font-extrabold ${tone || 'text-ink'}`}>{value}</p>
    {detail && <p className="mt-1 text-xs text-stone-400">{detail}</p>}
  </div>;
}

export default function AdminDashboard({ user, profile, onSignOut }) {
  const [active, setActive] = useState('overview');
  const [counts, setCounts] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const role = profile?.role || 'staff';
  const visibleModules = ['owner','admin'].includes(role) ? MODULES : MODULES.filter(item => (ROLE_MODULES[role] || ['overview']).includes(item.key));
  const module = visibleModules.find(item => item.key === active);

  async function loadCounts() {
    const tables = MODULES.filter(item => item.table && item.table !== 'site_settings');
    const results = await Promise.all(tables.map(async item => {
      const { count } = await supabase.from(item.table).select('*', { count: 'exact', head: true });
      return [item.table, count || 0];
    }));
    setCounts(Object.fromEntries(results));
  }

  async function loadRows(table) {
    setLoading(true);
    setNotice('');
    const query = supabase.from(table).select('*');
    const result = table === 'site_settings'
      ? await query.eq('id', true).maybeSingle()
      : table === 'gallery_items'
        ? await query.order('sort_order', { ascending: true }).order('created_at', { ascending: false }).limit(100)
        : await query.order('created_at', { ascending: false }).limit(100);
    const data = table === 'site_settings' ? (result.data ? [result.data] : []) : result.data;
    const error = result.error;
    if (error) setNotice(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { loadCounts(); }, []);
  useEffect(() => {
    if (!selectedImage) { setImagePreview(''); return undefined; }
    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);
  useEffect(() => {
    setSearch('');
    setEditingRow(null);
    setSelectedImage(null);
    if (module?.table) loadRows(module.table);
    else setRows([]);
  }, [active]);

  const visibleRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(q)));
  }, [rows, search]);

  async function updateStatus(row, value) {
    const { error } = await supabase.from(module.table).update({ status: value }).eq('id', row.id);
    if (error) setNotice(error.message);
    else {
      setRows(current => current.map(item => item.id === row.id ? { ...item, status: value } : item));
      setNotice('Record updated.');
      loadCounts();
    }
  }

  async function updateStaff(row, changes) {
    const { error } = await supabase.from('staff_profiles').update(changes).eq('id', row.id);
    if (error) setNotice(error.message);
    else {
      setRows(current => current.map(item => item.id === row.id ? { ...item, ...changes } : item));
      setNotice('Staff access updated.');
    }
  }

  async function inviteStaff(event) {
    event.preventDefault();
    setInviteBusy(true);
    setNotice('');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const { data } = await supabase.auth.getSession();
    try {
      const response = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + data.session.access_token },
        body: JSON.stringify(values)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Invitation failed.');
      setNotice(result.message || 'Invitation sent.');
      setCreating(false);
      loadRows('staff_profiles');
    } catch (error) {
      setNotice(error.message || 'Could not invite staff.');
    }
    setInviteBusy(false);
  }

  async function saveNew(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (values.sort_order !== undefined) values.sort_order = values.sort_order === '' ? null : Number(values.sort_order);
      if (active === 'gallery_items') {
        if (selectedImage) {
          values.media_url = await uploadGalleryImage(selectedImage);
          values.media_type = 'image';
        } else if (!values.media_url?.trim()) {
          throw new Error('Choose an image to upload or provide an existing media URL.');
        }
      }
      const { error } = await supabase.from(module.table).insert(values);
      if (error) throw error;
      setNotice(active === 'gallery_items' ? 'Photo uploaded and gallery record saved.' : 'New record saved.');
      setCreating(false);
      setSelectedImage(null);
      loadRows(module.table);
      loadCounts();
    } catch (error) {
      setNotice(error.message || 'Could not save this record.');
    } finally { setSaving(false); }
  }

  async function saveGalleryEdit(event) {
    event.preventDefault();
    if (!editingRow) return;
    setSaving(true);
    setNotice('');
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      values.sort_order = values.sort_order === '' ? null : Number(values.sort_order);
      if (selectedImage) {
        values.media_url = await uploadGalleryImage(selectedImage);
        values.media_type = 'image';
      } else if (!values.media_url?.trim()) {
        throw new Error('Choose a replacement image or provide an existing media URL.');
      }
      const { error } = await supabase.from('gallery_items').update(values).eq('id', editingRow.id);
      if (error) throw error;
      setNotice('Homepage photo updated.');
      setEditingRow(null);
      setSelectedImage(null);
      loadRows('gallery_items');
    } catch (error) {
      setNotice(error.message || 'Could not update this photo.');
    } finally { setSaving(false); }
  }

  const canCreate = ['leads', 'customers', 'crm_activities', 'events', 'content_pages', 'services', 'courses', 'menu_items', 'gallery_items', 'testimonials'].includes(active) && !(role === 'content_editor' && ['courses','menu_items'].includes(active));

  return <div className="min-h-screen bg-[#f6f5f0] text-ink">
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-leaf text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="text-xs font-bold uppercase tracking-[.22em] text-saffron">Chef Godwin</div>
          <div className="mt-1 text-xl font-extrabold">Control room</div>
          <div className="mt-1 text-xs text-white/60">Website + customer operations</div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleModules.map(item => <button key={item.key} onClick={() => { setActive(item.key); setCreating(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active === item.key ? 'bg-saffron text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
            <span className="w-5 text-center text-base">{item.icon}</span><span className="flex-1">{item.label}</span>
            {item.table && counts[item.table] > 0 && <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">{counts[item.table]}</span>}
          </button>)}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-bold">{profile?.full_name || user.email}</p>
          <p className="mt-1 text-xs capitalize text-saffron">{role.replaceAll('_', ' ')}</p>
          <button onClick={onSignOut} className="mt-4 w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10">Sign out</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-chili">Chef Godwin management</p>
            <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">{active === 'overview' ? 'Business overview' : TITLES[active] || module?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-leaf/10 px-3 py-1.5 text-xs font-bold capitalize text-leaf sm:inline-flex">{role.replaceAll('_', ' ')}</span>
            <button onClick={onSignOut} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-bold lg:hidden">Exit</button>
          </div>
        </header>

        <div className="space-y-6 p-4 sm:p-8">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {visibleModules.map(item => <button key={item.key} onClick={() => setActive(item.key)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${active === item.key ? 'bg-leaf text-white' : 'bg-white text-stone-600'}`}>{item.label}</button>)}
          </div>

          {notice && <div className="rounded-xl border border-saffron/40 bg-saffron/10 px-4 py-3 text-sm text-ink" role="status">{notice}</div>}
          {active === 'gallery_items' && <div className="rounded-2xl border border-leaf/15 bg-white p-4 sm:p-5"><p className="font-extrabold text-leaf">Homepage hero photography</p><p className="mt-1 text-sm leading-6 text-stone-600">The original Chef Godwin hero photograph appears first. Published images added here and photos attached to published menu items can then rotate in the homepage slider. Use Display order to arrange gallery photos; videos remain in the gallery and are excluded from the hero.</p></div>}

          {active === 'overview' ? <>
            <div className="rounded-3xl bg-leaf p-6 text-white sm:p-8">
              <p className="text-sm font-semibold text-saffron">Good to see you, {profile?.full_name || 'Super Administrator'}</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">Your kitchen, school and customer relationships in one place.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Manage enquiries, confirm bookings, follow up applicants, track payments and publish website updates from this workspace.</p>
              <button onClick={() => setActive('leads')} className="mt-6 rounded-lg bg-saffron px-5 py-3 text-sm font-extrabold text-ink">Open lead pipeline →</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="New leads" value={counts.leads ?? '—'} detail="Enquiries waiting for attention" />
              <Metric label="Catering bookings" value={counts.catering_bookings ?? '—'} detail="Bookings and event requests" />
              <Metric label="School applications" value={counts.school_applications ?? '—'} detail="Cooking school applicants" />
              <Metric label="Customers" value={counts.customers ?? '—'} detail="Customer records" />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h3 className="font-extrabold">Operations</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">{['leads','catering_bookings','school_applications','crm_activities','events','payments'].filter(key => visibleModules.some(item => item.key === key)).map(key => <button key={key} onClick={() => setActive(key)} className="rounded-xl bg-stone-50 p-3 text-left hover:bg-leaf/10"><span className="block text-xl font-extrabold">{counts[key] ?? 0}</span><span className="text-xs capitalize text-stone-500">{key.replaceAll('_',' ')}</span></button>)}</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h3 className="font-extrabold">Website publishing</h3>
                <p className="mt-2 text-sm text-stone-500">Manage published services, courses, menu items, testimonials and the photographs that appear in the homepage hero and public gallery.</p>
                <div className="mt-4 flex flex-wrap gap-2">{['content_pages','services','courses','menu_items','gallery_items','testimonials'].filter(key => visibleModules.some(item => item.key === key)).map(key => <button key={key} onClick={() => setActive(key)} className="rounded-full border border-stone-200 px-3 py-2 text-xs font-bold hover:border-leaf hover:text-leaf">{MODULES.find(m=>m.key===key).label}</button>)}</div>
              </div>
            </div>
          </> : module?.table ? <>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><p className="text-sm text-stone-500">Showing up to 100 recent records. Your assigned role controls what you can access.</p></div>
              <div className="flex gap-2">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="min-w-0 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-leaf" />
                <button onClick={() => loadRows(module.table)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-bold">Refresh</button>
                {(canCreate || (active === 'staff_profiles' && role === 'owner')) && <button onClick={() => setCreating(v=>!v)} className="rounded-lg bg-chili px-4 py-2 text-sm font-bold text-white">{active === 'staff_profiles' ? '+ Invite staff' : '+ Add new'}</button>}
              </div>
            </div>

            {creating && active === 'staff_profiles' && role === 'owner' && <form onSubmit={inviteStaff} className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
              <h3 className="font-extrabold sm:col-span-2">Invite a staff member</h3>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Full name<input name="full_name" required className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal"/></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Email address<input name="email" type="email" required className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal"/></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Phone number<input name="phone" type="tel" className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal"/></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Role<select name="role" required className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal"><option value="admin">Administrator</option><option value="manager">Manager</option><option value="content_editor">Content editor</option><option value="chef">Chef</option><option value="events">Events</option><option value="admissions">Admissions</option><option value="finance">Finance</option><option value="receptionist">Receptionist</option></select></label>
              <div className="flex gap-2 sm:col-span-2"><button disabled={inviteBusy} className="rounded-lg bg-leaf px-4 py-2 text-sm font-bold text-white">{inviteBusy ? 'Sending invitation…' : 'Send invitation'}</button><button type="button" onClick={()=>setCreating(false)} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-bold">Cancel</button></div>
            </form>}
            {editingRow && active === 'gallery_items' && <form onSubmit={saveGalleryEdit} className="grid gap-3 rounded-2xl border border-saffron/40 bg-white p-5 sm:grid-cols-2">
              <h3 className="font-extrabold sm:col-span-2">Edit homepage photo or gallery item</h3>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Title<input name="title" required defaultValue={editingRow.title || ''} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600 sm:col-span-2">Upload a replacement image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={e => setSelectedImage(e.target.files?.[0] || null)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-normal" /><span className="font-normal text-stone-500">Original quality preserved • JPEG, PNG, WebP, AVIF or GIF • up to 25 MB</span>{imagePreview && <img src={imagePreview} alt="Selected replacement preview" className="mt-2 max-h-48 w-full rounded-xl object-contain object-left" />}</label>
              <label className="grid gap-1 text-xs font-bold text-stone-600 sm:col-span-2">Or keep/change the existing image or video URL<input name="media_url" type="url" defaultValue={editingRow.media_url || ''} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Media type<select name="media_type" defaultValue={editingRow.media_type || 'image'} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal"><option value="image">Image</option><option value="video">Video</option></select></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Category<input name="category" defaultValue={editingRow.category || ''} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600 sm:col-span-2">Description<textarea name="description" rows="2" defaultValue={editingRow.description || ''} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Alternative text<input name="alt_text" defaultValue={editingRow.alt_text || ''} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Display order<input name="sort_order" type="number" min="0" defaultValue={editingRow.sort_order ?? 0} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>
              <label className="grid gap-1 text-xs font-bold text-stone-600">Publishing status<select name="status" defaultValue={editingRow.status || 'draft'} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
              <div className="flex gap-2 sm:col-span-2"><button disabled={saving} className="rounded-lg bg-leaf px-4 py-2 text-sm font-bold text-white">{saving ? 'Saving photo…' : 'Save changes'}</button><button type="button" onClick={() => { setEditingRow(null); setSelectedImage(null); }} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-bold">Cancel</button></div>
            </form>}
            {creating && active !== 'staff_profiles' && <form onSubmit={saveNew} className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
              <h3 className="font-extrabold sm:col-span-2">Create {module.label.toLowerCase()}</h3>
              {active === 'gallery_items' && <label className="grid gap-1 text-xs font-bold text-stone-600 sm:col-span-2">Upload a high-quality image<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={e => setSelectedImage(e.target.files?.[0] || null)} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-normal" /><span className="font-normal text-stone-500">Original file is stored unchanged • JPEG, PNG, WebP, AVIF or GIF • maximum 25 MB</span>{imagePreview && <img src={imagePreview} alt="Selected image preview" className="mt-2 max-h-56 w-full rounded-xl object-contain object-left" />}</label>}
              {(active === 'leads' ? ['full_name','phone','email','interest','source','status','notes'] :
                active === 'customers' ? ['full_name','phone','email','source','notes'] :
                active === 'events' ? ['title','event_type','description','venue','starts_at','ends_at','status'] :
                active === 'crm_activities' ? ['activity_type','subject','details','outcome','next_action_at'] :
                active === 'content_pages' ? ['title','slug','excerpt','seo_title','seo_description','status'] :
                active === 'services' ? ['title','slug','summary','price_label','image_url','status'] :
                active === 'courses' ? ['title','slug','summary','duration_label','level','fee','status'] :
                active === 'menu_items' ? ['name','description','price','currency','image_url','status'] :
                active === 'gallery_items' ? ['title','description','media_url','media_type','category','alt_text','sort_order','status'] :
                ['customer_name','customer_title','quote','rating','status']).map(field => <label key={field} className="grid gap-1 text-xs font-bold text-stone-600">{FIELD_LABELS[field] || field}<input name={field} required={['title','slug','full_name','name','phone','interest','quote','customer_name'].includes(field)} type={field.includes('date') || field.endsWith('_at') ? 'datetime-local' : field === 'fee' || field === 'rating' || field === 'price' || field === 'sort_order' ? 'number' : 'text'} defaultValue={field === 'status' ? (STATUS_OPTIONS[active]?.[0] || 'new') : field === 'currency' ? 'UGX' : field === 'sort_order' ? '0' : ''} className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-normal" /></label>)}
              <div className="flex gap-2 sm:col-span-2"><button disabled={saving} className="rounded-lg bg-leaf px-4 py-2 text-sm font-bold text-white">{saving ? 'Saving…' : 'Save record'}</button><button type="button" onClick={()=>{setCreating(false);setSelectedImage(null);}} className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-bold">Cancel</button></div>
            </form>}

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {loading ? <p className="p-8 text-center text-sm text-stone-500">Loading records…</p> : visibleRows.length === 0 ? <div className="p-10 text-center"><div className="text-3xl">⌁</div><p className="mt-2 font-bold">Nothing here yet</p><p className="mt-1 text-sm text-stone-500">New website enquiries and records will appear here.</p></div> :
                <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"><tr>{(VISIBLE_FIELDS[active] || Object.keys(visibleRows[0]).slice(0,6)).map(field=><th key={field} className="px-4 py-3 font-bold">{FIELD_LABELS[field] || field.replaceAll('_',' ')}</th>)}<th className="px-4 py-3">Manage</th></tr></thead>
                  <tbody className="divide-y divide-stone-100">{visibleRows.map(row=><tr key={row.id} className="hover:bg-stone-50/70">{(VISIBLE_FIELDS[active] || Object.keys(row).slice(0,6)).map(field=><td key={field} className="max-w-[240px] px-4 py-3 text-stone-700">{field === 'status' ? <span className="rounded-full bg-saffron/15 px-2.5 py-1 text-xs font-bold capitalize">{row[field]}</span> : field === 'amount' || field === 'fee' || field === 'price' || field === 'quoted_amount' || field === 'final_amount' ? money(row[field],row.currency || 'UGX') : field.endsWith('_at') || field.endsWith('_date') || field === 'created_at' || field === 'updated_at' ? date(row[field]) : field === 'is_active' || field === 'is_available' ? (row[field] ? 'Yes' : 'No') : <span className="block truncate">{row[field] ?? '—'}</span>}</td>)}<td className="px-4 py-3">{STATUS_OPTIONS[active] && <select aria-label="Change status" value={row.status || ''} onChange={e=>updateStatus(row,e.target.value)} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"><option value="">Status</option>{STATUS_OPTIONS[active].map(value=><option key={value} value={value}>{value}</option>)}</select>}{active === 'gallery_items' && <button onClick={() => { setCreating(false); setEditingRow(row); }} className="mb-2 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-leaf hover:border-leaf">Edit photo</button>}{active==='staff_profiles' && <div className="flex min-w-[170px] flex-col gap-2"><select aria-label="Staff role" value={row.role} disabled={row.role==='owner' || !['owner','admin'].includes(role)} onChange={e=>updateStaff(row,{role:e.target.value})} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"><option value="admin">Administrator</option><option value="manager">Manager</option><option value="content_editor">Content editor</option><option value="chef">Chef</option><option value="events">Events</option><option value="admissions">Admissions</option><option value="finance">Finance</option><option value="receptionist">Receptionist</option></select><button disabled={row.role==='owner' || !['owner','admin'].includes(role)} onClick={()=>updateStaff(row,{is_active:!row.is_active})} className="rounded-lg border border-stone-200 px-2 py-1 text-xs font-bold">{row.is_active?'Suspend access':'Restore access'}</button></div>}</td></tr>)}</tbody>
                </table></div>}
            </div>
          </> : null}
        </div>
      </main>
    </div>
  </div>;
}
