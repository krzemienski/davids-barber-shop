import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAdminListWallEntries, getAdminListWallEntriesQueryKey, getListWallEntriesQueryKey, useAdminCreateWallEntry, useAdminUpdateWallEntry, useAdminDeleteWallEntry,
} from '@workspace/api-client-react';
import type { WallEntry, WallEntryInput } from '@workspace/api-client-react';
import { useUpload } from '@workspace/object-storage-web';
import { Plus, Pencil, ArrowUp, ArrowDown, Upload, Loader2, EyeOff, ShieldCheck, ImageOff, ExternalLink } from 'lucide-react';
import { PageTitle, Panel, Pill, Btn, SaveBtn, Modal, Field, Toggle, ConfirmDelete, AdminEmpty } from './shell';
import { SkeletonBlock } from '@/components/site';
import { useToast } from '@/hooks/use-toast';
import { assetUrl, basePath, errorMessage } from '@/lib/format';
import { cn } from '@/lib/utils';

const storagePath = (objectPath: string) => `/api/storage${objectPath}`;

export default function AdminWallPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const list = useAdminListWallEntries();
  const update = useAdminUpdateWallEntry();
  const del = useAdminDeleteWallEntry();
  const [editing, setEditing] = useState<WallEntry | 'new' | null>(null);
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getAdminListWallEntriesQueryKey() });
    qc.invalidateQueries({ queryKey: getListWallEntriesQueryKey() });
  };
  const entries = [...(list.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
  const shown = entries.filter((e) => e.permissionOnFile && e.photoUrl).length;

  const move = async (i: number, dir: -1 | 1) => {
    const a = entries[i]; const b = entries[i + dir];
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
      <PageTitle title="From the wall" sub="Framed photos from the shop, shown as a timeline on Our Story and as a teaser on the home page."
        actions={<Btn onClick={() => setEditing('new')} data-testid="button-new-wall"><Plus className="h-3.5 w-3.5" /> Add photo</Btn>} />
      <div className="mb-4 flex items-start gap-2 border border-gold/25 bg-background/60 px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          An entry appears on the site only when <span className="text-bone">Permission on file</span> is on. Turn it on only after you have written permission from everyone named or shown
          (and from the broadcaster for TV stills). Until then the photo, caption and names never leave the server. These photos are never used in ads.
          {' '}<span className="text-bone" data-testid="text-wall-shown-count">{shown} of {entries.length} shown publicly.</span>
        </p>
      </div>
      <Panel>
        {list.isLoading ? <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <SkeletonBlock key={i} className="h-20" />)}</div>
          : list.isError ? <AdminEmpty title="Could not load the wall" action={<Btn variant="outline" onClick={() => list.refetch()}>Retry</Btn>} />
          : entries.length === 0 ? <AdminEmpty title="No photos yet" body="Add the first framed photo. Nothing shows on the site until permission is on file." action={<Btn onClick={() => setEditing('new')}><Plus className="h-3.5 w-3.5" /> Add photo</Btn>} />
          : (
            <ul className="divide-y divide-card-border">
              {entries.map((e, i) => (
                <li key={e.id} className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap', !e.permissionOnFile && 'bg-oxblood/[0.04]')} data-testid={`row-wall-${e.id}`}>
                  <div className="flex flex-col">
                    <button disabled={i === 0 || update.isPending} onClick={() => move(i, -1)} className="p-0.5 text-muted-foreground hover:text-gold disabled:opacity-20" aria-label="Move up" data-testid={`button-wall-up-${e.id}`}><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button disabled={i === entries.length - 1 || update.isPending} onClick={() => move(i, 1)} className="p-0.5 text-muted-foreground hover:text-gold disabled:opacity-20" aria-label="Move down" data-testid={`button-wall-down-${e.id}`}><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="h-14 w-20 shrink-0 overflow-hidden border border-border bg-background">
                    {e.photoUrl ? <img src={assetUrl(e.photoUrl)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageOff className="h-4 w-4" /></div>}
                  </div>
                  <div className="min-w-0 flex-1 basis-[calc(100%-8.5rem)] sm:basis-auto">
                    <p className="line-clamp-2 text-sm text-bone sm:line-clamp-1">{e.caption}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {e.permissionOnFile ? <Pill tone="green">Shown on site</Pill> : <Pill tone="red">Hidden · no permission</Pill>}
                      {e.year != null ? <Pill>{e.year}</Pill> : <Pill>No year</Pill>}
                      {e.people.length > 0 && <Pill>{e.people.join(', ')}</Pill>}
                      {e.pressOutlet && <Pill tone="gold">TV: {e.pressOutlet}</Pill>}
                      {!e.photoUrl && <Pill tone="gold">No photo</Pill>}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
                  <Toggle checked={e.permissionOnFile} testId={`switch-wall-permission-${e.id}`}
                    label={<span className="text-xs">Permission on file</span>}
                    onChange={(v) => update.mutate({ id: e.id, data: { permissionOnFile: v } }, {
                      onSuccess: () => { invalidate(); toast({ title: v ? 'Now shown on the site' : 'Hidden from the site' }); },
                      onError: (err) => toast({ title: 'Update failed', description: errorMessage(err), variant: 'destructive' }),
                    })} />
                  <a href={`${basePath}/our-story#from-the-wall`} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground hover:text-gold" aria-label="View on site" data-testid={`link-view-wall-${e.id}`}><ExternalLink className="h-4 w-4" /></a>
                  <button onClick={() => setEditing(e)} className="p-1.5 text-muted-foreground hover:text-gold" aria-label="Edit" data-testid={`button-edit-wall-${e.id}`}><Pencil className="h-4 w-4" /></button>
                  <ConfirmDelete what="this photo" testId={`button-delete-wall-${e.id}`} onConfirm={() => del.mutate({ id: e.id }, { onSuccess: () => { invalidate(); toast({ title: 'Photo removed' }); }, onError: (err) => toast({ title: 'Delete failed', description: errorMessage(err), variant: 'destructive' }) })} />
                  </div>
                </li>
              ))}
            </ul>
          )}
      </Panel>
      {editing && <WallForm entry={editing === 'new' ? null : editing} nextOrder={entries.length} onClose={() => setEditing(null)} onSaved={invalidate} />}
    </>
  );
}

type Form = { photoUrl: string | null; caption: string; year: string; people: string; pressOutlet: string; permissionOnFile: boolean; displayOrder: string };

function WallForm({ entry, nextOrder, onClose, onSaved }: { entry: WallEntry | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const create = useAdminCreateWallEntry();
  const update = useAdminUpdateWallEntry();
  const [f, setF] = useState<Form>(() => ({
    photoUrl: entry?.photoUrl ?? null, caption: entry?.caption ?? '', year: entry?.year != null ? String(entry.year) : '',
    people: entry?.people.join(', ') ?? '', pressOutlet: entry?.pressOutlet ?? '', permissionOnFile: entry?.permissionOnFile ?? false,
    displayOrder: String(entry?.displayOrder ?? nextOrder),
  }));
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const photo = useUpload({
    onSuccess: (r) => set('photoUrl', storagePath(r.objectPath)),
    onError: (e) => toast({ title: 'Photo upload failed', description: e.message, variant: 'destructive' }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data: WallEntryInput = {
      photoUrl: f.photoUrl, caption: f.caption.trim(),
      year: f.year.trim() ? Number(f.year) : null,
      people: f.people.split(',').map((s) => s.trim()).filter(Boolean),
      pressOutlet: f.pressOutlet.trim() || null,
      permissionOnFile: f.permissionOnFile,
      displayOrder: Number(f.displayOrder) || 0,
    };
    const opts = { onSuccess: () => { onSaved(); toast({ title: entry ? 'Entry saved' : 'Entry added' }); onClose(); }, onError: (err: unknown) => toast({ title: 'Save failed', description: errorMessage(err), variant: 'destructive' }) };
    if (entry) update.mutate({ id: entry.id, data }, opts); else create.mutate({ data }, opts);
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={entry ? 'Edit wall photo' : 'Add wall photo'} wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <div className="grid aspect-[4/3] place-items-center overflow-hidden border border-border bg-background">
              {f.photoUrl ? <img src={assetUrl(f.photoUrl)} alt="" className="h-full w-full object-contain" /> : <ImageOff className="h-6 w-6 text-muted-foreground" />}
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-1.5 border border-dashed border-gold/40 py-2 text-xs text-gold hover:bg-gold/10">
              {photo.isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {f.photoUrl ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/*" className="hidden" data-testid="input-wall-photo" onChange={(e) => { const file = e.target.files?.[0]; if (file) photo.uploadFile(file); e.target.value = ''; }} />
            </label>
          </div>
          <div className="space-y-4">
            <Field label="Caption" hint="What the photo shows. Only facts you know."><textarea required rows={3} maxLength={500} className="field" value={f.caption} onChange={(e) => set('caption', e.target.value)} data-testid="input-wall-caption" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Year" hint="Leave blank if unsure. Never guess."><input type="number" min={1900} max={2100} className="field" value={f.year} onChange={(e) => set('year', e.target.value)} data-testid="input-wall-year" /></Field>
              <Field label="Display order" hint="Lower comes first"><input type="number" className="field" value={f.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} data-testid="input-wall-order" /></Field>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="People in the photo" hint="Comma separated. Shown only with permission."><input className="field" value={f.people} onChange={(e) => set('people', e.target.value)} data-testid="input-wall-people" /></Field>
          <Field label="TV or press credit" hint={'Shown as text: "As seen on …". No logos.'}><input className="field" maxLength={120} value={f.pressOutlet} onChange={(e) => set('pressOutlet', e.target.value)} placeholder="FOX 5 Good Day New York" data-testid="input-wall-press" /></Field>
        </div>
        <div className={cn('border-l-2 px-4 py-3', f.permissionOnFile ? 'border-[hsl(140_35%_50%)] bg-[hsl(140_35%_50%)]/5' : 'border-oxblood bg-oxblood/10')}>
          <Toggle checked={f.permissionOnFile} onChange={(v) => set('permissionOnFile', v)} testId="switch-wall-permission"
            label={f.permissionOnFile ? <span className="text-xs text-[hsl(140_35%_65%)]">Permission on file: shown on the site</span> : <span className="flex items-center gap-1 text-xs text-[hsl(354_70%_68%)]"><EyeOff className="h-3 w-3" /> No permission yet: never shown</span>} />
          <p className="mt-2 text-[11px] text-muted-foreground">New York law requires written consent to use a person&rsquo;s name or photo to promote a business. Turn this on only once it is on file.</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Btn type="button" variant="ghost" onClick={onClose}>Cancel</Btn>
          <SaveBtn pending={create.isPending || update.isPending || photo.isUploading} data-testid="button-save-wall">{entry ? 'Save changes' : 'Add photo'}</SaveBtn>
        </div>
      </form>
    </Modal>
  );
}
