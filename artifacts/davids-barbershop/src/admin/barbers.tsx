import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminListBarbers, getAdminListBarbersQueryKey, getListBarbersQueryKey, useAdminCreateBarber, useAdminUpdateBarber, useAdminDeleteBarber, useRequestUploadUrl,
} from '@workspace/api-client-react';
import type { Barber, NotableClient, BarberInput } from '@workspace/api-client-react';
import { useUpload } from '@workspace/object-storage-web';
import { Plus, Pencil, ArrowUp, ArrowDown, Upload, X, Loader2, EyeOff, ShieldCheck, ExternalLink } from 'lucide-react';
import { PageTitle, Panel, Pill, Btn, SaveBtn, Modal, Field, Toggle, ConfirmDelete, AdminEmpty } from './shell';
import { BarberPortrait, SkeletonBlock } from '@/components/site';
import { useToast } from '@/hooks/use-toast';
import { assetUrl, basePath, errorMessage } from '@/lib/format';
import { cn } from '@/lib/utils';

const storagePath = (objectPath: string) => `/api/storage${objectPath}`;

export default function AdminBarbersPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const list = useAdminListBarbers();
  const update = useAdminUpdateBarber();
  const del = useAdminDeleteBarber();
  const [editing, setEditing] = useState<Barber | 'new' | null>(null);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getAdminListBarbersQueryKey() });
    qc.invalidateQueries({ queryKey: getListBarbersQueryKey() });
  };
  const barbers = [...(list.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const move = async (i: number, dir: -1 | 1) => {
    const a = barbers[i]; const b = barbers[i + dir];
    if (!a || !b) return;
    const ao = a.displayOrder === b.displayOrder ? i : a.displayOrder;
    const bo = a.displayOrder === b.displayOrder ? i + dir : b.displayOrder;
    try {
      await Promise.all([
        update.mutateAsync({ id: a.id, data: { displayOrder: bo } }),
        update.mutateAsync({ id: b.id, data: { displayOrder: ao } }),
      ]);
    } catch (e) { toast({ title: 'Reorder failed', description: errorMessage(e), variant: 'destructive' }); }
    invalidate();
  };

  return (
    <>
      <PageTitle title="Barbers" sub="Who appears on the site, in what order, and where their Book button goes." actions={<Btn onClick={() => setEditing('new')} data-testid="button-new-barber"><Plus className="h-3.5 w-3.5" /> Add barber</Btn>} />
      <Panel>
        {list.isLoading ? <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <SkeletonBlock key={i} className="h-20" />)}</div>
          : list.isError ? <AdminEmpty title="Could not load barbers" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} />
          : barbers.length === 0 ? <AdminEmpty title="No barbers yet" body="Add the first chair." action={<Btn onClick={() => setEditing('new')}><Plus className="h-3.5 w-3.5" /> Add barber</Btn>} />
          : (
            <ul className="divide-y divide-card-border">
              {barbers.map((b, i) => {
                const hidden = b.notableClients.filter((c) => !c.consent).length;
                return (
                  <li key={b.id} className={cn('flex items-center gap-4 px-4 py-3', !b.active && 'opacity-60')} data-testid={`row-barber-${b.id}`}>
                    <div className="flex flex-col">
                      <button disabled={i === 0 || update.isPending} onClick={() => move(i, -1)} className="p-0.5 text-muted-foreground hover:text-gold disabled:opacity-20" aria-label="Move up" data-testid={`button-up-${b.id}`}><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button disabled={i === barbers.length - 1 || update.isPending} onClick={() => move(i, 1)} className="p-0.5 text-muted-foreground hover:text-gold disabled:opacity-20" aria-label="Move down" data-testid={`button-down-${b.id}`}><ArrowDown className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="h-14 w-12 shrink-0 overflow-hidden border border-border"><BarberPortrait barber={b} className="[&_span]:text-xl" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-lg text-bone">{b.name}</span>
                        <span className="text-xs text-muted-foreground">{b.title}</span>
                        {!b.active && <Pill>Hidden</Pill>}
                        {!b.photoUrl && <Pill tone="gold">No photo</Pill>}
                        {!b.booksyUrl && <Pill>Shop Booksy link</Pill>}
                        {hidden > 0 && <Pill tone="red">{hidden} unconsented client{hidden > 1 ? 's' : ''} hidden</Pill>}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground truncate">/barbers/{b.slug} · order {b.displayOrder}</div>
                    </div>
                    <Toggle checked={b.active} label={<span className="hidden sm:inline text-xs">Active</span>} testId={`switch-active-${b.id}`}
                      onChange={(v) => update.mutate({ id: b.id, data: { active: v } }, { onSuccess: invalidate, onError: (e) => toast({ title: 'Update failed', description: errorMessage(e), variant: 'destructive' }) })} />
                    <a href={`${basePath}/barbers/${b.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground hover:text-gold" aria-label="View" data-testid={`link-view-barber-${b.id}`}><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => setEditing(b)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Edit" data-testid={`button-edit-barber-${b.id}`}><Pencil className="h-4 w-4" /></button>
                    <ConfirmDelete what={b.name} testId={`button-delete-barber-${b.id}`} onConfirm={() => del.mutate({ id: b.id }, { onSuccess: () => { invalidate(); toast({ title: `${b.name} removed` }); }, onError: (e) => toast({ title: 'Delete failed', description: errorMessage(e), variant: 'destructive' }) })} />
                  </li>
                );
              })}
            </ul>
          )}
      </Panel>
      {editing && <BarberForm barber={editing === 'new' ? null : editing} nextOrder={barbers.length} onClose={() => setEditing(null)} onSaved={invalidate} />}
    </>
  );
}

type Form = {
  name: string; slug: string; title: string; photoUrl: string | null; bio: string; yearsCutting: string; specialties: string;
  galleryImages: string[]; instagramUrl: string; tiktokUrl: string; otherSocialUrl: string; booksyUrl: string; displayOrder: string; active: boolean; notableClients: NotableClient[];
};

function BarberForm({ barber, nextOrder, onClose, onSaved }: { barber: Barber | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const create = useAdminCreateBarber();
  const update = useAdminUpdateBarber();
  const requestUrl = useRequestUploadUrl();
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [f, setF] = useState<Form>(() => ({
    name: barber?.name ?? '', slug: barber?.slug ?? '', title: barber?.title ?? 'Barber', photoUrl: barber?.photoUrl ?? null, bio: barber?.bio ?? '',
    yearsCutting: barber?.yearsCutting != null ? String(barber.yearsCutting) : '', specialties: barber?.specialties.join(', ') ?? '',
    galleryImages: barber?.galleryImages ?? [], instagramUrl: barber?.instagramUrl ?? '', tiktokUrl: barber?.tiktokUrl ?? '', otherSocialUrl: barber?.otherSocialUrl ?? '',
    booksyUrl: barber?.booksyUrl ?? '', displayOrder: String(barber?.displayOrder ?? nextOrder), active: barber?.active ?? true, notableClients: barber?.notableClients ?? [],
  }));
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const photo = useUpload({
    onSuccess: (r) => set('photoUrl', storagePath(r.objectPath)),
    onError: (e) => toast({ title: 'Photo upload failed', description: e.message, variant: 'destructive' }),
  });

  const uploadGallery = async (files: FileList | null) => {
    if (!files?.length) return;
    setGalleryBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const res = await requestUrl.mutateAsync({ data: { name: file.name, size: file.size, contentType: file.type || 'application/octet-stream' } });
        const put = await fetch(res.uploadURL, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
        if (!put.ok) throw new Error('Upload to storage failed');
        added.push(storagePath(res.objectPath));
      } catch (e) {
        toast({ title: `Could not upload ${file.name}`, description: errorMessage(e), variant: 'destructive' });
      }
    }
    setF((p) => ({ ...p, galleryImages: [...p.galleryImages, ...added] }));
    setGalleryBusy(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const nz = (s: string) => (s.trim() ? s.trim() : null);
    const data: BarberInput = {
      name: f.name.trim(), title: f.title.trim(), photoUrl: f.photoUrl, bio: f.bio,
      yearsCutting: f.yearsCutting.trim() ? Number(f.yearsCutting) : null,
      specialties: f.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      galleryImages: f.galleryImages, instagramUrl: nz(f.instagramUrl), tiktokUrl: nz(f.tiktokUrl), otherSocialUrl: nz(f.otherSocialUrl), booksyUrl: nz(f.booksyUrl),
      displayOrder: Number(f.displayOrder) || 0, active: f.active,
      notableClients: f.notableClients.filter((c) => c.name.trim()).map((c) => ({ ...c, name: c.name.trim(), note: c.note?.trim() || null })),
      ...(f.slug.trim() ? { slug: f.slug.trim() } : {}),
    };
    const opts = { onSuccess: () => { onSaved(); toast({ title: barber ? 'Barber saved' : 'Barber added' }); onClose(); }, onError: (err: unknown) => toast({ title: 'Save failed', description: errorMessage(err), variant: 'destructive' }) };
    if (barber) update.mutate({ id: barber.id, data }, opts); else create.mutate({ data }, opts);
  };

  const pending = create.isPending || update.isPending;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={barber ? `Edit ${barber.name}` : 'Add barber'} wide>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-[160px_1fr]">
          <div className="space-y-2">
            <div className="aspect-[4/5] overflow-hidden border border-border"><BarberPortrait barber={{ name: f.name || '?', photoUrl: f.photoUrl }} className="[&_span]:text-4xl" /></div>
            <label className="flex cursor-pointer items-center justify-center gap-1.5 border border-dashed border-gold/40 py-2 text-xs text-gold hover:bg-gold/10">
              {photo.isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {f.photoUrl ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" data-testid="input-photo" onChange={(e) => { const file = e.target.files?.[0]; if (file) photo.uploadFile(file); e.target.value = ''; }} />
            </label>
            {f.photoUrl && <button type="button" onClick={() => set('photoUrl', null)} className="w-full text-[11px] text-muted-foreground hover:text-bone" data-testid="button-remove-photo">Remove photo</button>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input required className="field" value={f.name} onChange={(e) => set('name', e.target.value)} data-testid="input-name" /></Field>
            <Field label="URL slug" hint="Leave blank to generate from name"><input className="field font-mono" value={f.slug} onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} data-testid="input-slug" /></Field>
            <Field label="Title"><input className="field" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Master Barber" data-testid="input-title" /></Field>
            <Field label="Years cutting"><input type="number" min={0} className="field" value={f.yearsCutting} onChange={(e) => set('yearsCutting', e.target.value)} data-testid="input-years" /></Field>
            <Field label="Specialties" hint="Comma separated" className="sm:col-span-2"><input className="field" value={f.specialties} onChange={(e) => set('specialties', e.target.value)} placeholder="Skin fades, Scissor cuts, Hot-towel shaves" data-testid="input-specialties" /></Field>
          </div>
        </div>
        <Field label="Bio"><textarea required rows={4} className="field" value={f.bio} onChange={(e) => set('bio', e.target.value)} data-testid="input-bio" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Booksy link" hint="Blank = shop-wide Booksy link"><input type="url" className="field" value={f.booksyUrl} onChange={(e) => set('booksyUrl', e.target.value)} data-testid="input-booksy" /></Field>
          <Field label="Instagram"><input type="url" className="field" value={f.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} data-testid="input-instagram" /></Field>
          <Field label="TikTok"><input type="url" className="field" value={f.tiktokUrl} onChange={(e) => set('tiktokUrl', e.target.value)} data-testid="input-tiktok" /></Field>
          <Field label="Other social"><input type="url" className="field" value={f.otherSocialUrl} onChange={(e) => set('otherSocialUrl', e.target.value)} data-testid="input-other-social" /></Field>
          <Field label="Display order"><input type="number" className="field" value={f.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} data-testid="input-order" /></Field>
          <div className="flex items-end pb-2"><Toggle checked={f.active} onChange={(v) => set('active', v)} label="Active (shown on site)" testId="switch-active" /></div>
        </div>

        <div>
          <div className="flex items-center justify-between"><span className="text-xs font-medium text-bone/85">Gallery</span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-gold hover:underline">
              {galleryBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Add images
              <input type="file" accept="image/*" multiple className="hidden" data-testid="input-gallery" onChange={(e) => { uploadGallery(e.target.files); e.target.value = ''; }} />
            </label>
          </div>
          {f.galleryImages.length === 0 ? <p className="mt-2 border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">No gallery images yet.</p> : (
            <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {f.galleryImages.map((g, i) => (
                <div key={g + i} className="group relative aspect-square overflow-hidden border border-border">
                  <img src={assetUrl(g)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => set('galleryImages', f.galleryImages.filter((_, j) => j !== i))} className="absolute right-1 top-1 bg-ink/80 p-1 text-bone opacity-0 group-hover:opacity-100" aria-label="Remove" data-testid={`button-remove-gallery-${i}`}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-gold/25 bg-background/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-bone/85">Notable clients</span>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Only clients with written consent on file are ever shown publicly. Unconsented names stay private to staff.</p>
            </div>
            <Btn type="button" variant="outline" onClick={() => set('notableClients', [...f.notableClients, { name: '', consent: false, note: null }])} data-testid="button-add-client"><Plus className="h-3.5 w-3.5" /> Add</Btn>
          </div>
          {f.notableClients.length > 0 && (
            <ul className="mt-3 space-y-2">
              {f.notableClients.map((c, i) => (
                <li key={i} className={cn('grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] items-center border-l-2 pl-3', c.consent ? 'border-[hsl(140_35%_50%)]' : 'border-oxblood')}>
                  <input className="field" placeholder="Name" value={c.name} onChange={(e) => set('notableClients', f.notableClients.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} data-testid={`input-client-name-${i}`} />
                  <input className="field" placeholder="Note (optional)" value={c.note ?? ''} onChange={(e) => set('notableClients', f.notableClients.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} data-testid={`input-client-note-${i}`} />
                  <Toggle checked={c.consent} onChange={(v) => set('notableClients', f.notableClients.map((x, j) => j === i ? { ...x, consent: v } : x))}
                    label={c.consent ? <span className="text-xs text-[hsl(140_35%_65%)]">Consent on file</span> : <span className="flex items-center gap-1 text-xs text-[hsl(354_70%_68%)]"><EyeOff className="h-3 w-3" /> Never shown</span>} testId={`switch-consent-${i}`} />
                  <button type="button" onClick={() => set('notableClients', f.notableClients.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-bone" aria-label="Remove client" data-testid={`button-remove-client-${i}`}><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn>
          <SaveBtn pending={pending || photo.isUploading || galleryBusy} data-testid="button-save-barber">{barber ? 'Save changes' : 'Add barber'}</SaveBtn>
        </div>
      </form>
    </Modal>
  );
}
