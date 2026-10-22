import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminListServices, getAdminListServicesQueryKey, getListServicesQueryKey, useAdminCreateService, useAdminUpdateService, useAdminDeleteService,
  useAdminListLandingPages, getAdminListLandingPagesQueryKey, useAdminCreateLandingPage, useAdminUpdateLandingPage, useAdminDeleteLandingPage,
  useAdminListBookings, getAdminListBookingsQueryKey, useAdminCreateBooking, useAdminDeleteBooking,
  useAdminListCampaigns, getAdminListCampaignsQueryKey, useAdminCreateCampaign, useAdminUpdateCampaign, useAdminDeleteCampaign,
  useAdminListUsers, getAdminListUsersQueryKey, useAdminCreateUser, useAdminDeleteUser,
  useGetSiteSettings, getGetSiteSettingsQueryKey, useUpdateSiteSettings, useAdminListBarbers, getAdminGetPerformanceQueryKey,
} from '@workspace/api-client-react';
import type { Service, LandingPage, Booking, Campaign, HoursEntry, BookingInputSource, CampaignInputPlatform, AdminUserInputRole, SiteSettings } from '@workspace/api-client-react';
import { Plus, Pencil, Copy, Check, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { PageTitle, Panel, Pill, Btn, SaveBtn, Modal, Field, Toggle, ConfirmDelete, AdminEmpty, TableWrap, th, td, useMe } from './shell';
import { SkeletonBlock } from '@/components/site';
import { useToast } from '@/hooks/use-toast';
import { basePath, centsToDollarsInput, dollarsToCents, errorMessage, money, formatPhone } from '@/lib/format';
import { cn } from '@/lib/utils';

function useErrToast() {
  const { toast } = useToast();
  return (title: string) => (e: unknown) => toast({ title, description: errorMessage(e), variant: 'destructive' });
}

function LoadingRows() {
  return <div className="p-5 space-y-2">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-10" />)}</div>;
}

const DollarInput = ({ value, onChange, testId, required }: { value: string; onChange: (v: string) => void; testId: string; required?: boolean }) => (
  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
    <input inputMode="decimal" required={required} className="field pl-7 font-mono" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} /></div>
);

/* ============================ SERVICES ============================ */
export function AdminServicesPage() {
  const qc = useQueryClient();
  const errT = useErrToast();
  const list = useAdminListServices();
  const del = useAdminDeleteService();
  const update = useAdminUpdateService();
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const invalidate = () => { qc.invalidateQueries({ queryKey: getAdminListServicesQueryKey() }); qc.invalidateQueries({ queryKey: getListServicesQueryKey() }); };
  const groups = useMemo(() => {
    const m = new Map<string, Service[]>();
    [...(list.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder).forEach((s) => { if (!m.has(s.category)) m.set(s.category, []); m.get(s.category)!.push(s); });
    return [...m.entries()];
  }, [list.data]);
  const categories = groups.map(([c]) => c);
  return (
    <>
      <PageTitle title="Services" sub="The menu and prices shown on the site." actions={<Btn onClick={() => setEditing('new')} data-testid="button-new-service"><Plus className="h-3.5 w-3.5" /> Add service</Btn>} />
      {list.isLoading ? <Panel><LoadingRows /></Panel> : list.isError ? <Panel><AdminEmpty title="Could not load services" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} /></Panel>
        : groups.length === 0 ? <Panel><AdminEmpty title="No services yet" action={<Btn onClick={() => setEditing('new')}>Add the first</Btn>} /></Panel>
        : <div className="space-y-6">{groups.map(([cat, items]) => (
          <Panel key={cat} title={cat}>
            <TableWrap>
              <thead><tr><th className={th}>Service</th><th className={cn(th, 'text-right')}>Price</th><th className={cn(th, 'text-right')}>Minutes</th><th className={cn(th, 'text-right')}>Order</th><th className={th}>Active</th><th className={th} /></tr></thead>
              <tbody>{items.map((s) => (
                <tr key={s.id} className={cn(!s.active && 'opacity-55')} data-testid={`row-service-${s.id}`}>
                  <td className={td}><div className="text-bone">{s.name}</div>{s.description && <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>}</td>
                  <td className={cn(td, 'text-right font-mono text-gold')}>{money(s.priceCents, { cents: true })}</td>
                  <td className={cn(td, 'text-right font-mono')}>{s.durationMinutes ?? '—'}</td>
                  <td className={cn(td, 'text-right font-mono')}>{s.displayOrder}</td>
                  <td className={td}><Toggle checked={s.active} label="" testId={`switch-service-${s.id}`} onChange={(v) => update.mutate({ id: s.id, data: { active: v } }, { onSuccess: invalidate, onError: errT('Update failed') })} /></td>
                  <td className={cn(td, 'text-right whitespace-nowrap')}>
                    <button onClick={() => setEditing(s)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Edit" data-testid={`button-edit-service-${s.id}`}><Pencil className="h-4 w-4" /></button>
                    <ConfirmDelete what={s.name} testId={`button-delete-service-${s.id}`} onConfirm={() => del.mutate({ id: s.id }, { onSuccess: invalidate, onError: errT('Delete failed') })} />
                  </td>
                </tr>
              ))}</tbody>
            </TableWrap>
          </Panel>
        ))}</div>}
      {editing && <ServiceForm service={editing === 'new' ? null : editing} categories={categories} onClose={() => setEditing(null)} onSaved={invalidate} />}
    </>
  );
}

function ServiceForm({ service, categories, onClose, onSaved }: { service: Service | null; categories: string[]; onClose: () => void; onSaved: () => void }) {
  const errT = useErrToast();
  const create = useAdminCreateService();
  const update = useAdminUpdateService();
  const [f, setF] = useState({
    name: service?.name ?? '', description: service?.description ?? '', price: centsToDollarsInput(service?.priceCents ?? null), duration: service?.durationMinutes != null ? String(service.durationMinutes) : '',
    category: service?.category ?? categories[0] ?? 'Haircuts', order: String(service?.displayOrder ?? 0), active: service?.active ?? true,
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = { name: f.name.trim(), description: f.description, priceCents: dollarsToCents(f.price) ?? 0, durationMinutes: f.duration ? Number(f.duration) : null, category: f.category.trim(), displayOrder: Number(f.order) || 0, active: f.active };
    const opts = { onSuccess: () => { onSaved(); onClose(); }, onError: errT('Save failed') };
    if (service) update.mutate({ id: service.id, data }, opts); else create.mutate({ data }, opts);
  };
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={service ? 'Edit service' : 'Add service'}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2"><input required className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} data-testid="input-service-name" /></Field>
        <Field label="Description" className="sm:col-span-2"><textarea rows={2} className="field" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} data-testid="input-service-description" /></Field>
        <Field label="Price"><DollarInput required value={f.price} onChange={(v) => setF({ ...f, price: v })} testId="input-service-price" /></Field>
        <Field label="Duration (minutes)"><input type="number" min={0} className="field" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} data-testid="input-service-duration" /></Field>
        <Field label="Category"><input required list="cats" className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} data-testid="input-service-category" /><datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></Field>
        <Field label="Display order"><input type="number" className="field" value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} data-testid="input-service-order" /></Field>
        <div className="sm:col-span-2"><Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" testId="switch-service-active" /></div>
        <div className="sm:col-span-2 flex justify-end gap-2 border-t border-border pt-4"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><SaveBtn pending={create.isPending || update.isPending} data-testid="button-save-service" /></div>
      </form>
    </Modal>
  );
}

/* ============================ LANDING PAGES ============================ */
function CopyBtn({ text, testId }: { text: string; testId: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1400); }).catch(() => undefined); }}
      className="p-1 text-muted-foreground hover:text-gold shrink-0" aria-label="Copy" data-testid={testId}>{done ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5" />}</button>
  );
}

export function AdminLandingPagesPage() {
  const qc = useQueryClient();
  const errT = useErrToast();
  const list = useAdminListLandingPages();
  const barbers = useAdminListBarbers();
  const del = useAdminDeleteLandingPage();
  const [editing, setEditing] = useState<LandingPage | 'new' | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListLandingPagesQueryKey() });
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const barberName = (id: number | null) => barbers.data?.find((b) => b.id === id)?.name;
  return (
    <>
      <PageTitle title="Landing pages" sub="Ad destinations at /l/slug. Add variant B copy to split traffic 50/50." actions={<Btn onClick={() => setEditing('new')} data-testid="button-new-landing"><Plus className="h-3.5 w-3.5" /> New page</Btn>} />
      {list.isLoading ? <Panel><LoadingRows /></Panel> : list.isError ? <Panel><AdminEmpty title="Could not load landing pages" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} /></Panel>
        : !list.data?.length ? <Panel><AdminEmpty title="No landing pages yet" body="Create one per ad campaign or barber." action={<Btn onClick={() => setEditing('new')}>Create one</Btn>} /></Panel>
        : <div className="grid gap-4 lg:grid-cols-2">{list.data.map((p) => {
          const url = `${origin}${basePath}/l/${p.slug}`;
          const tagged = `${url}?utm_source=google&utm_medium=cpc&utm_campaign=${encodeURIComponent(p.slug)}`;
          return (
            <Panel key={p.id} className={cn(!p.active && 'opacity-60')}>
              <div className="p-5 space-y-4" data-testid={`card-landing-${p.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Pill tone="gold">{p.kind}</Pill>{p.kind === 'barber' && <Pill>{barberName(p.barberId) ?? 'No barber'}</Pill>}
                    {p.variantBHeadline ? <Pill tone="green">A/B live</Pill> : <Pill>A only</Pill>}{!p.active && <Pill tone="red">Inactive</Pill>}
                  </div>
                  <div className="flex shrink-0">
                    <a href={url} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Open" data-testid={`link-open-landing-${p.id}`}><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => setEditing(p)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Edit" data-testid={`button-edit-landing-${p.id}`}><Pencil className="h-4 w-4" /></button>
                    <ConfirmDelete what={`/l/${p.slug}`} testId={`button-delete-landing-${p.id}`} onConfirm={() => del.mutate({ id: p.id }, { onSuccess: invalidate, onError: errT('Delete failed') })} />
                  </div>
                </div>
                <div><span className="font-mono text-[10px] text-gold mr-2">A</span><span className="font-display text-xl text-bone">{p.headline}</span><p className="text-sm text-muted-foreground">{p.subheadline}</p></div>
                {p.variantBHeadline && <div><span className="font-mono text-[10px] text-gold mr-2">B</span><span className="font-display text-xl text-bone">{p.variantBHeadline}</span><p className="text-sm text-muted-foreground">{p.variantBSubheadline}</p></div>}
                <div className="space-y-1.5 border-t border-card-border pt-3">
                  <div className="flex items-center gap-2 bg-background px-2.5 py-1.5"><code className="flex-1 truncate font-mono text-[11.5px] text-bone">{url}</code><CopyBtn text={url} testId={`button-copy-url-${p.id}`} /></div>
                  <div className="flex items-center gap-2 bg-background px-2.5 py-1.5"><code className="flex-1 truncate font-mono text-[11px] text-muted-foreground">{tagged}</code><CopyBtn text={tagged} testId={`button-copy-tagged-${p.id}`} /></div>
                  <p className="text-[10.5px] text-muted-foreground">Google adds gclid automatically; Meta adds fbclid. Use utm_source=facebook for Meta ads.</p>
                </div>
              </div>
            </Panel>
          );
        })}</div>}
      {editing && <LandingForm page={editing === 'new' ? null : editing} barbers={(barbers.data ?? []).map((b) => ({ id: b.id, name: b.name }))} onClose={() => setEditing(null)} onSaved={invalidate} />}
    </>
  );
}

function LandingForm({ page, barbers, onClose, onSaved }: { page: LandingPage | null; barbers: { id: number; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const errT = useErrToast();
  const create = useAdminCreateLandingPage();
  const update = useAdminUpdateLandingPage();
  const [f, setF] = useState({
    slug: page?.slug ?? '', kind: (page?.kind ?? 'offer') as 'barber' | 'offer', barberId: page?.barberId != null ? String(page.barberId) : '',
    headline: page?.headline ?? '', subheadline: page?.subheadline ?? '', bH: page?.variantBHeadline ?? '', bS: page?.variantBSubheadline ?? '', active: page?.active ?? true,
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      slug: f.slug.trim(), kind: f.kind, barberId: f.kind === 'barber' && f.barberId ? Number(f.barberId) : null, headline: f.headline.trim(), subheadline: f.subheadline,
      variantBHeadline: f.bH.trim() || null, variantBSubheadline: f.bH.trim() ? (f.bS.trim() || null) : null, active: f.active,
    };
    const opts = { onSuccess: () => { onSaved(); onClose(); }, onError: errT('Save failed') };
    if (page) update.mutate({ id: page.id, data }, opts); else create.mutate({ data }, opts);
  };
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={page ? 'Edit landing page' : 'New landing page'} wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug" hint={`URL: ${basePath}/l/${f.slug || 'your-slug'}`}><input required className="field font-mono" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} data-testid="input-landing-slug" /></Field>
        <Field label="Kind">
          <select className="field" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as 'barber' | 'offer' })} data-testid="select-landing-kind">
            <option value="offer">Offer (price-led)</option><option value="barber">Barber (features one barber)</option>
          </select>
        </Field>
        {f.kind === 'barber' && (
          <Field label="Barber" className="sm:col-span-2">
            <select required className="field" value={f.barberId} onChange={(e) => setF({ ...f, barberId: e.target.value })} data-testid="select-landing-barber">
              <option value="">Choose a barber</option>{barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        )}
        <div className="sm:col-span-2 grid gap-4 border-l-2 border-gold pl-4">
          <Field label="Variant A headline"><input required className="field" value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} data-testid="input-landing-headline" /></Field>
          <Field label="Variant A subheadline"><textarea rows={2} className="field" value={f.subheadline} onChange={(e) => setF({ ...f, subheadline: e.target.value })} data-testid="input-landing-subheadline" /></Field>
        </div>
        <div className="sm:col-span-2 grid gap-4 border-l-2 border-border pl-4">
          <Field label="Variant B headline" hint="Optional. When set, visitors are split 50/50 and stay on their variant."><input className="field" value={f.bH} onChange={(e) => setF({ ...f, bH: e.target.value })} data-testid="input-landing-b-headline" /></Field>
          <Field label="Variant B subheadline"><textarea rows={2} className="field" value={f.bS} onChange={(e) => setF({ ...f, bS: e.target.value })} disabled={!f.bH.trim()} data-testid="input-landing-b-subheadline" /></Field>
        </div>
        <div className="sm:col-span-2"><Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" testId="switch-landing-active" /></div>
        <div className="sm:col-span-2 flex justify-end gap-2 border-t border-border pt-4"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><SaveBtn pending={create.isPending || update.isPending} data-testid="button-save-landing" /></div>
      </form>
    </Modal>
  );
}

/* ============================ BOOKINGS ============================ */
const SOURCES: { v: BookingInputSource; l: string }[] = [
  { v: 'google_ads', l: 'Google Ads' }, { v: 'meta_ads', l: 'Meta Ads' }, { v: 'organic', l: 'Organic' }, { v: 'walk_in', l: 'Walk-in' }, { v: 'other', l: 'Other' },
];

function nyConversionTime(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'longOffset' }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const hour = g('hour') === '24' ? '00' : g('hour');
  const tz = g('timeZoneName').replace('GMT', '') || '+00:00';
  const offset = tz.replace(':', '');
  return `${g('year')}-${g('month')}-${g('day')} ${hour}:${g('minute')}:${g('second')}${offset}`;
}

function csvCell(v: string) { return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }

export function AdminBookingsPage() {
  const qc = useQueryClient();
  const errT = useErrToast();
  const { toast } = useToast();
  const list = useAdminListBookings();
  const del = useAdminDeleteBooking();
  const [open, setOpen] = useState(false);
  const invalidate = () => { qc.invalidateQueries({ queryKey: getAdminListBookingsQueryKey() }); qc.invalidateQueries({ queryKey: getAdminGetPerformanceQueryKey() }); qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('/api/admin/performance') }); };
  const bookings = [...(list.data ?? [])].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt));
  const withGclid = bookings.filter((b) => b.gclid);

  const exportCsv = () => {
    if (!withGclid.length) { toast({ title: 'Nothing to export', description: 'No bookings have a Google Click ID yet.' }); return; }
    const rows = [['Google Click ID', 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency']];
    withGclid.forEach((b) => rows.push([b.gclid!, 'booking_confirmed', nyConversionTime(b.bookedAt), (b.valueCents / 100).toFixed(2), 'USD']));
    const csv = 'Parameters:TimeZone=America/New_York\n' + rows.map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `google-ads-offline-conversions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <>
      <PageTitle title="Bookings" sub="Log confirmed Booksy bookings so cost per booking is real."
        actions={<>
          <Btn variant="outline" onClick={exportCsv} data-testid="button-export-csv"><Download className="h-3.5 w-3.5" /> Export Google Ads offline conversions CSV <span className="font-mono text-gold">({withGclid.length})</span></Btn>
          <Btn onClick={() => setOpen(true)} data-testid="button-new-booking"><Plus className="h-3.5 w-3.5" /> Log booking</Btn>
        </>} />
      <Panel>
        {list.isLoading ? <LoadingRows /> : list.isError ? <AdminEmpty title="Could not load bookings" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} />
          : bookings.length === 0 ? <AdminEmpty title="No bookings logged" body="Each confirmed Booksy booking you log here feeds the performance report." action={<Btn onClick={() => setOpen(true)}>Log the first</Btn>} />
          : (
            <TableWrap>
              <thead><tr><th className={th}>When</th><th className={th}>Barber</th><th className={cn(th, 'text-right')}>Value</th><th className={th}>Source</th><th className={th}>Campaign</th><th className={th}>Click ID</th><th className={th}>Repeat</th><th className={th}>Notes</th><th className={th} /></tr></thead>
              <tbody>{bookings.map((b: Booking) => (
                <tr key={b.id} data-testid={`row-booking-${b.id}`}>
                  <td className={cn(td, 'font-mono text-xs whitespace-nowrap')}>{new Date(b.bookedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })}</td>
                  <td className={td}>{b.barberName ?? <span className="text-muted-foreground">Shop</span>}</td>
                  <td className={cn(td, 'text-right font-mono text-gold')}>{money(b.valueCents, { cents: true })}</td>
                  <td className={td}><Pill tone={b.source === 'google_ads' || b.source === 'meta_ads' ? 'gold' : 'muted'}>{SOURCES.find((s) => s.v === b.source)?.l ?? b.source}</Pill></td>
                  <td className={cn(td, 'font-mono text-xs')}>{b.utmCampaign ?? '—'}</td>
                  <td className={cn(td, 'font-mono text-[11px] max-w-[140px] truncate')} title={b.gclid ?? b.fbclid ?? ''}>{b.gclid ? `gclid ${b.gclid.slice(0, 10)}…` : b.fbclid ? `fbclid ${b.fbclid.slice(0, 10)}…` : '—'}</td>
                  <td className={td}>{b.isRepeatClient ? <Pill tone="green">Repeat</Pill> : <Pill>New</Pill>}</td>
                  <td className={cn(td, 'text-xs text-muted-foreground max-w-[200px] truncate')}>{b.notes}</td>
                  <td className={cn(td, 'text-right')}><ConfirmDelete what="this booking" testId={`button-delete-booking-${b.id}`} onConfirm={() => del.mutate({ id: b.id }, { onSuccess: invalidate, onError: errT('Delete failed') })} /></td>
                </tr>
              ))}</tbody>
            </TableWrap>
          )}
      </Panel>
      {open && <BookingForm onClose={() => setOpen(false)} onSaved={invalidate} />}
    </>
  );
}

function localNowInput() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16);
}

function BookingForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const errT = useErrToast();
  const create = useAdminCreateBooking();
  const barbers = useAdminListBarbers();
  const settings = useGetSiteSettings();
  const [f, setF] = useState({ barberId: '', bookedAt: localNowInput(), value: '', source: 'google_ads' as BookingInputSource, utmCampaign: '', gclid: '', fbclid: '', repeat: false, notes: '' });
  useEffect(() => { if (settings.data && !f.value) setF((p) => ({ ...p, value: centsToDollarsInput(settings.data!.offerPriceCents) })); }, [settings.data]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ data: {
      barberId: f.barberId ? Number(f.barberId) : null, bookedAt: new Date(f.bookedAt).toISOString(), valueCents: dollarsToCents(f.value) ?? 0, source: f.source,
      utmCampaign: f.utmCampaign.trim() || null, gclid: f.gclid.trim() || null, fbclid: f.fbclid.trim() || null, isRepeatClient: f.repeat, notes: f.notes.trim() || null,
    } }, { onSuccess: () => { onSaved(); onClose(); }, onError: errT('Could not log booking') });
  };
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title="Log a confirmed booking" description="Copy the details from the Booksy confirmation." wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Barber"><select className="field" value={f.barberId} onChange={(e) => setF({ ...f, barberId: e.target.value })} data-testid="select-booking-barber"><option value="">Shop / unassigned</option>{barbers.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
        <Field label="Booked at"><input required type="datetime-local" className="field" value={f.bookedAt} onChange={(e) => setF({ ...f, bookedAt: e.target.value })} data-testid="input-booking-date" /></Field>
        <Field label="Value"><DollarInput value={f.value} onChange={(v) => setF({ ...f, value: v })} testId="input-booking-value" /></Field>
        <Field label="Source"><select className="field" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as BookingInputSource })} data-testid="select-booking-source">{SOURCES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}</select></Field>
        <Field label="Campaign (utm_campaign)"><input className="field font-mono" value={f.utmCampaign} onChange={(e) => setF({ ...f, utmCampaign: e.target.value })} data-testid="input-booking-campaign" /></Field>
        <Field label="gclid" hint="Required for the Google Ads export"><input className="field font-mono" value={f.gclid} onChange={(e) => setF({ ...f, gclid: e.target.value })} data-testid="input-booking-gclid" /></Field>
        <Field label="fbclid"><input className="field font-mono" value={f.fbclid} onChange={(e) => setF({ ...f, fbclid: e.target.value })} data-testid="input-booking-fbclid" /></Field>
        <div className="flex items-end pb-2"><Toggle checked={f.repeat} onChange={(v) => setF({ ...f, repeat: v })} label="Repeat client" testId="switch-booking-repeat" /></div>
        <Field label="Notes" className="sm:col-span-2"><textarea rows={2} className="field" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} data-testid="input-booking-notes" /></Field>
        <div className="sm:col-span-2 flex justify-end gap-2 border-t border-border pt-4"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><SaveBtn pending={create.isPending} data-testid="button-save-booking">Log booking</SaveBtn></div>
      </form>
    </Modal>
  );
}

/* ============================ CAMPAIGNS ============================ */
export function AdminCampaignsPage() {
  const qc = useQueryClient();
  const errT = useErrToast();
  const list = useAdminListCampaigns();
  const update = useAdminUpdateCampaign();
  const del = useAdminDeleteCampaign();
  const [editing, setEditing] = useState<Campaign | 'new' | null>(null);
  const invalidate = () => { qc.invalidateQueries({ queryKey: getAdminListCampaignsQueryKey() }); qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('/api/admin/performance') }); };
  const rows = list.data ?? [];
  const totalSpend = rows.reduce((a, c) => a + c.spendCents, 0);
  return (
    <>
      <PageTitle title="Campaigns" sub={<>Spend to date across all campaigns: <span className="font-mono text-gold">{money(totalSpend, { cents: true })}</span></>} actions={<Btn onClick={() => setEditing('new')} data-testid="button-new-campaign"><Plus className="h-3.5 w-3.5" /> Add campaign</Btn>} />
      <Panel>
        {list.isLoading ? <LoadingRows /> : list.isError ? <AdminEmpty title="Could not load campaigns" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} />
          : rows.length === 0 ? <AdminEmpty title="No campaigns yet" body="Add each Google or Meta campaign and update its spend weekly." action={<Btn onClick={() => setEditing('new')}>Add the first</Btn>} />
          : (
            <TableWrap>
              <thead><tr><th className={th}>Campaign</th><th className={th}>Platform</th><th className={th}>Barber</th><th className={th}>Landing</th><th className={cn(th, 'text-right')}>Budget</th><th className={cn(th, 'text-right')}>Spend</th><th className={th}>Dates</th><th className={th}>Active</th><th className={th} /></tr></thead>
              <tbody>{rows.map((c) => {
                const pct = c.budgetCents ? Math.min(100, (c.spendCents / c.budgetCents) * 100) : 0;
                return (
                  <tr key={c.id} className={cn(!c.active && 'opacity-55')} data-testid={`row-campaign-${c.id}`}>
                    <td className={cn(td, 'text-bone')}>{c.name}</td>
                    <td className={td}><Pill tone="gold">{c.platform === 'google_ads' ? 'Google' : 'Meta'}</Pill></td>
                    <td className={td}>{c.barberName ?? <span className="text-muted-foreground">Shop</span>}</td>
                    <td className={cn(td, 'font-mono text-xs')}>{c.landingPageSlug ? `/l/${c.landingPageSlug}` : '—'}</td>
                    <td className={cn(td, 'text-right font-mono')}>{money(c.budgetCents)}</td>
                    <td className={cn(td, 'text-right')}><div className="font-mono text-gold">{money(c.spendCents, { cents: true })}</div>{c.budgetCents > 0 && <div className="mt-1 ml-auto h-1 w-20 bg-muted"><div className="h-full bg-gold" style={{ width: `${pct}%` }} /></div>}</td>
                    <td className={cn(td, 'font-mono text-[11px] whitespace-nowrap text-muted-foreground')}>{c.startDate ?? '—'} → {c.endDate ?? 'open'}</td>
                    <td className={td}><Toggle checked={c.active} label="" testId={`switch-campaign-${c.id}`} onChange={(v) => update.mutate({ id: c.id, data: { active: v } }, { onSuccess: invalidate, onError: errT('Update failed') })} /></td>
                    <td className={cn(td, 'text-right whitespace-nowrap')}>
                      <button onClick={() => setEditing(c)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Edit" data-testid={`button-edit-campaign-${c.id}`}><Pencil className="h-4 w-4" /></button>
                      <ConfirmDelete what={c.name} testId={`button-delete-campaign-${c.id}`} onConfirm={() => del.mutate({ id: c.id }, { onSuccess: invalidate, onError: errT('Delete failed') })} />
                    </td>
                  </tr>
                );
              })}</tbody>
            </TableWrap>
          )}
      </Panel>
      {editing && <CampaignForm campaign={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={invalidate} />}
    </>
  );
}

function CampaignForm({ campaign, onClose, onSaved }: { campaign: Campaign | null; onClose: () => void; onSaved: () => void }) {
  const errT = useErrToast();
  const create = useAdminCreateCampaign();
  const update = useAdminUpdateCampaign();
  const barbers = useAdminListBarbers();
  const pages = useAdminListLandingPages();
  const [f, setF] = useState({
    name: campaign?.name ?? '', platform: (campaign?.platform ?? 'google_ads') as CampaignInputPlatform, barberId: campaign?.barberId != null ? String(campaign.barberId) : '',
    landingPageSlug: campaign?.landingPageSlug ?? '', budget: centsToDollarsInput(campaign?.budgetCents ?? null), spend: centsToDollarsInput(campaign?.spendCents ?? null),
    startDate: campaign?.startDate?.slice(0, 10) ?? '', endDate: campaign?.endDate?.slice(0, 10) ?? '', active: campaign?.active ?? true,
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      name: f.name.trim(), platform: f.platform, barberId: f.barberId ? Number(f.barberId) : null, landingPageSlug: f.landingPageSlug || null,
      budgetCents: dollarsToCents(f.budget) ?? 0, spendCents: dollarsToCents(f.spend) ?? 0, startDate: f.startDate || null, endDate: f.endDate || null, active: f.active,
    };
    const opts = { onSuccess: () => { onSaved(); onClose(); }, onError: errT('Save failed') };
    if (campaign) update.mutate({ id: campaign.id, data }, opts); else create.mutate({ data }, opts);
  };
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={campaign ? 'Edit campaign' : 'Add campaign'} wide>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2"><input required className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} data-testid="input-campaign-name" /></Field>
        <Field label="Platform"><select className="field" value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value as CampaignInputPlatform })} data-testid="select-campaign-platform"><option value="google_ads">Google Ads</option><option value="meta_ads">Meta Ads</option></select></Field>
        <Field label="Barber"><select className="field" value={f.barberId} onChange={(e) => setF({ ...f, barberId: e.target.value })} data-testid="select-campaign-barber"><option value="">Shop-wide</option>{barbers.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
        <Field label="Landing page" className="sm:col-span-2"><select className="field" value={f.landingPageSlug} onChange={(e) => setF({ ...f, landingPageSlug: e.target.value })} data-testid="select-campaign-landing"><option value="">None</option>{pages.data?.map((p) => <option key={p.id} value={p.slug}>/l/{p.slug}</option>)}</select></Field>
        <Field label="Budget"><DollarInput value={f.budget} onChange={(v) => setF({ ...f, budget: v })} testId="input-campaign-budget" /></Field>
        <Field label="Spend to date" hint="From the ad platform"><DollarInput value={f.spend} onChange={(v) => setF({ ...f, spend: v })} testId="input-campaign-spend" /></Field>
        <Field label="Start date"><input type="date" className="field" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} data-testid="input-campaign-start" /></Field>
        <Field label="End date"><input type="date" className="field" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} data-testid="input-campaign-end" /></Field>
        <div className="sm:col-span-2"><Toggle checked={f.active} onChange={(v) => setF({ ...f, active: v })} label="Active" testId="switch-campaign-active" /></div>
        <div className="sm:col-span-2 flex justify-end gap-2 border-t border-border pt-4"><Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn><SaveBtn pending={create.isPending || update.isPending} data-testid="button-save-campaign" /></div>
      </form>
    </Modal>
  );
}

/* ============================ SETTINGS ============================ */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function AdminSettingsPage() {
  const s = useGetSiteSettings();
  return (
    <>
      <PageTitle title="Site settings" sub="Everything the public site says about the shop." />
      {s.isLoading ? <div className="space-y-4"><SkeletonBlock className="h-64" /><SkeletonBlock className="h-64" /></div>
        : s.isError || !s.data ? <Panel><AdminEmpty title="Could not load settings" action={<Btn variant="outline" onClick={() => s.refetch()}>Retry</Btn>} /></Panel>
        : <SettingsForm key={s.data.updatedAt} s={s.data} />}
    </>
  );
}

function SettingsForm({ s }: { s: SiteSettings }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const save = useUpdateSiteSettings();
  const [f, setF] = useState({
    shopName: s.shopName, foundedYear: String(s.foundedYear), phone: s.phone, email: s.email, streetAddress: s.streetAddress, city: s.city, region: s.region, postalCode: s.postalCode,
    offer: centsToDollarsInput(s.offerPriceCents), comparison: centsToDollarsInput(s.comparisonPriceCents), comparisonSourceNote: s.comparisonSourceNote ?? '',
    announcementBanner: s.announcementBanner ?? '', booksyBusinessUrl: s.booksyBusinessUrl ?? '', instagramUrl: s.instagramUrl ?? '', googleMapsUrl: s.googleMapsUrl ?? '',
  });
  const [hours, setHours] = useState<HoursEntry[]>(() => DAYS.map((d) => s.hours.find((h) => h.day === d) ?? { day: d, open: '09:00', close: '19:00', closed: false }));
  const setH = (i: number, patch: Partial<HoursEntry>) => setHours((p) => p.map((h, j) => (j === i ? { ...h, ...patch } : h)));
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const comparisonWithoutSource = !!f.comparison.trim() && !f.comparisonSourceNote.trim();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const nz = (v: string) => v.trim() || null;
    save.mutate({ data: {
      shopName: f.shopName.trim(), foundedYear: Number(f.foundedYear), phone: f.phone.trim(), email: f.email.trim(), streetAddress: f.streetAddress.trim(), city: f.city.trim(), region: f.region.trim(), postalCode: f.postalCode.trim(),
      hours: hours.map((h) => (h.closed ? { ...h, open: null, close: null } : h)),
      offerPriceCents: dollarsToCents(f.offer) ?? 0, comparisonPriceCents: dollarsToCents(f.comparison), comparisonSourceNote: nz(f.comparisonSourceNote),
      announcementBanner: nz(f.announcementBanner), booksyBusinessUrl: nz(f.booksyBusinessUrl), instagramUrl: nz(f.instagramUrl), googleMapsUrl: nz(f.googleMapsUrl),
    } }, {
      onSuccess: (data) => { qc.setQueryData(getGetSiteSettingsQueryKey(), data); toast({ title: 'Settings saved', description: 'The public site is updated.' }); },
      onError: (err) => toast({ title: 'Save failed', description: errorMessage(err), variant: 'destructive' }),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Panel title="Offer & pricing">
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <Field label="Offer price (headline)" hint="Used in the hero and ads"><DollarInput required value={f.offer} onChange={(v) => setF({ ...f, offer: v })} testId="input-offer-price" /></Field>
          <Field label="Comparison price" hint="Blank hides the comparison line"><DollarInput value={f.comparison} onChange={(v) => setF({ ...f, comparison: v })} testId="input-comparison-price" /></Field>
          <Field label="Comparison source" hint="Where the number comes from"><input className="field" value={f.comparisonSourceNote} onChange={up('comparisonSourceNote')} data-testid="input-comparison-source" /></Field>
          {comparisonWithoutSource && <p className="sm:col-span-3 flex items-center gap-2 text-xs text-gold"><AlertTriangle className="h-3.5 w-3.5" /> Add a source for the comparison price so the claim is substantiated.</p>}
          <Field label="Announcement banner" hint="Blank hides the banner" className="sm:col-span-3"><input className="field" value={f.announcementBanner} onChange={up('announcementBanner')} data-testid="input-banner" /></Field>
        </div>
      </Panel>
      <Panel title="Hours">
        <ul className="divide-y divide-card-border">
          {hours.map((h, i) => (
            <li key={h.day} className="grid grid-cols-[110px_1fr] sm:grid-cols-[140px_auto_1fr] items-center gap-4 px-5 py-2.5" data-testid={`row-hours-${h.day}`}>
              <span className="text-sm text-bone">{h.day}</span>
              <Toggle checked={!h.closed} onChange={(v) => setH(i, v ? { closed: false, open: h.open ?? '09:00', close: h.close ?? '19:00' } : { closed: true })} label={<span className={cn('text-xs w-12', h.closed && 'text-[hsl(354_70%_68%)]')}>{h.closed ? 'Closed' : 'Open'}</span>} testId={`switch-open-${h.day}`} />
              {!h.closed && (
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                  <input type="time" className="field w-32 font-mono" value={h.open ?? ''} onChange={(e) => setH(i, { open: e.target.value })} data-testid={`input-open-${h.day}`} />
                  <span className="text-muted-foreground">to</span>
                  <input type="time" className="field w-32 font-mono" value={h.close ?? ''} onChange={(e) => setH(i, { close: e.target.value })} data-testid={`input-close-${h.day}`} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Shop details">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Shop name"><input required className="field" value={f.shopName} onChange={up('shopName')} data-testid="input-shop-name" /></Field>
          <Field label="Founded year"><input type="number" className="field" value={f.foundedYear} onChange={up('foundedYear')} data-testid="input-founded" /></Field>
          <Field label="Phone (E.164)" hint={f.phone ? `Shown as ${formatPhone(f.phone)}` : 'e.g. +12128619179'}><input required className="field font-mono" value={f.phone} onChange={up('phone')} data-testid="input-phone" /></Field>
          <Field label="Email"><input type="email" required className="field" value={f.email} onChange={up('email')} data-testid="input-email" /></Field>
          <Field label="Street address" className="sm:col-span-2"><input required className="field" value={f.streetAddress} onChange={up('streetAddress')} data-testid="input-street" /></Field>
          <Field label="City"><input required className="field" value={f.city} onChange={up('city')} data-testid="input-city" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="State"><input required className="field" value={f.region} onChange={up('region')} data-testid="input-region" /></Field>
            <Field label="ZIP"><input required className="field" value={f.postalCode} onChange={up('postalCode')} data-testid="input-postal" /></Field>
          </div>
        </div>
      </Panel>
      <Panel title="Links">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Booksy business URL" hint="Default Book link. Blank = Book buttons call instead." className="sm:col-span-2"><input type="url" className="field" value={f.booksyBusinessUrl} onChange={up('booksyBusinessUrl')} data-testid="input-booksy-url" /></Field>
          <Field label="Instagram URL"><input type="url" className="field" value={f.instagramUrl} onChange={up('instagramUrl')} data-testid="input-instagram-url" /></Field>
          <Field label="Google Maps URL"><input type="url" className="field" value={f.googleMapsUrl} onChange={up('googleMapsUrl')} data-testid="input-maps-url" /></Field>
        </div>
      </Panel>
      <div className="sticky bottom-0 -mx-5 md:-mx-8 flex justify-end border-t border-border bg-background/95 px-5 md:px-8 py-3 backdrop-blur">
        <SaveBtn pending={save.isPending} data-testid="button-save-settings">Save settings</SaveBtn>
      </div>
    </form>
  );
}

/* ============================ USERS ============================ */
export function AdminUsersPage() {
  const qc = useQueryClient();
  const errT = useErrToast();
  const me = useMe();
  const list = useAdminListUsers();
  const create = useAdminCreateUser();
  const del = useAdminDeleteUser();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminUserInputRole>('editor');
  const invalidate = () => qc.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ data: { email: email.trim().toLowerCase(), role } }, { onSuccess: () => { setEmail(''); invalidate(); }, onError: errT('Could not grant access') });
  };
  return (
    <>
      <PageTitle title="Staff access" sub="Who can sign in to this dashboard. Editors manage content; owners also manage staff." />
      <Panel title="Grant access" className="mb-6">
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 p-5">
          <input type="email" required placeholder="name@example.com" className="field flex-1" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-user-email" />
          <select className="field sm:w-36" value={role} onChange={(e) => setRole(e.target.value as AdminUserInputRole)} data-testid="select-user-role"><option value="editor">Editor</option><option value="owner">Owner</option></select>
          <SaveBtn pending={create.isPending} data-testid="button-grant-access"><Plus className="h-3.5 w-3.5" /> Grant</SaveBtn>
        </form>
      </Panel>
      <Panel>
        {list.isLoading ? <LoadingRows /> : list.isError ? <AdminEmpty title="Could not load staff" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} />
          : !list.data?.length ? <AdminEmpty title="No staff yet" /> : (
            <TableWrap>
              <thead><tr><th className={th}>Email</th><th className={th}>Role</th><th className={th}>Added</th><th className={th} /></tr></thead>
              <tbody>{list.data.map((u) => (
                <tr key={u.id} data-testid={`row-user-${u.id}`}>
                  <td className={cn(td, 'text-bone')}>{u.email}{me?.id === u.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</td>
                  <td className={td}><Pill tone={u.role === 'owner' ? 'gold' : 'muted'}>{u.role}</Pill></td>
                  <td className={cn(td, 'font-mono text-xs text-muted-foreground')}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className={cn(td, 'text-right')}>{me?.id !== u.id && <ConfirmDelete what={`access for ${u.email}`} testId={`button-revoke-${u.id}`} onConfirm={() => del.mutate({ id: u.id }, { onSuccess: invalidate, onError: errT('Could not revoke') })} />}</td>
                </tr>
              ))}</tbody>
            </TableWrap>
          )}
      </Panel>
    </>
  );
}
