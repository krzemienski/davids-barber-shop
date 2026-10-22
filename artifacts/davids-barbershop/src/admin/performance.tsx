import { useState } from 'react';
import { useAdminGetPerformance, getAdminGetPerformanceQueryKey, useAdminListRecentEvents, getAdminListRecentEventsQueryKey } from '@workspace/api-client-react';
import type { BarberPerformance } from '@workspace/api-client-react';
import { Phone, CalendarCheck, Eye, RotateCw } from 'lucide-react';
import { PageTitle, Panel, Pill, TableWrap, th, td, AdminEmpty, Btn } from './shell';
import { SkeletonBlock } from '@/components/site';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';

const RANGES = [7, 30, 90];

function statusPill(s: BarberPerformance['status']) {
  switch (s) {
    case 'on_target': return <Pill tone="green">On target</Pill>;
    case 'over_target': return <Pill tone="red">Over target</Pill>;
    case 'no_bookings': return <Pill tone="gold">Spend, no bookings</Pill>;
    default: return <Pill>No spend</Pill>;
  }
}

function relTime(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.max(1, Math.floor(d))}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PerformancePage() {
  const [days, setDays] = useState(30);
  const perf = useAdminGetPerformance({ days }, { query: { queryKey: getAdminGetPerformanceQueryKey({ days }) } });
  const events = useAdminListRecentEvents({ limit: 40 }, { query: { queryKey: getAdminListRecentEventsQueryKey({ limit: 40 }), refetchInterval: 30_000 } });
  const r = perf.data;
  const target = r?.targetCostPerBookingCents ?? 6000;
  const maxCpb = Math.max(target * 2, ...(r?.barbers.map((b) => b.costPerBookingCents ?? 0) ?? [0]));

  return (
    <>
      <PageTitle
        title="Performance"
        sub={<>Cost per booking vs. the <span className="text-gold font-medium">{money(target)}</span> target</>}
        actions={
          <div className="flex border border-border rounded-sm overflow-hidden" role="tablist">
            {RANGES.map((d) => (
              <button key={d} onClick={() => setDays(d)} data-testid={`button-range-${d}`}
                className={cn('px-3.5 h-9 text-xs font-mono transition-colors', days === d ? 'bg-gold text-ink' : 'text-muted-foreground hover:text-bone')}>{d}d</button>
            ))}
          </div>
        }
      />
      {perf.isLoading ? (
        <div className="space-y-6"><div className="grid gap-4 grid-cols-2 lg:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-24" />)}</div><SkeletonBlock className="h-72" /></div>
      ) : perf.isError || !r ? (
        <Panel><AdminEmpty title="Could not load performance" action={<Btn variant="outline" onClick={() => perf.refetch()}><RotateCw className="h-3.5 w-3.5" /> Retry</Btn>} /></Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-px bg-card-border border border-card-border grid-cols-2 lg:grid-cols-6">
            {[
              ['Cost / booking', r.totals.costPerBookingCents != null ? money(r.totals.costPerBookingCents, { cents: true }) : '—', r.totals.costPerBookingCents != null ? (r.totals.costPerBookingCents <= target ? 'text-[hsl(140_35%_65%)]' : 'text-[hsl(354_70%_68%)]') : ''],
              ['Spend', money(r.totals.spendCents, { cents: true }), ''],
              ['Bookings', String(r.totals.bookings), 'text-gold'],
              ['Book clicks', String(r.totals.bookClicks), ''],
              ['Call clicks', String(r.totals.callClicks), ''],
              ['Landing views', String(r.totals.landingViews), ''],
            ].map(([l, v, c], i) => (
              <div key={l} className={cn('bg-card p-5', i === 0 && 'col-span-2 lg:col-span-1')} data-testid={`stat-${l.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
                <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{l}</div>
                <div className={cn('mt-2 font-mono text-2xl text-bone', c)}>{v}</div>
              </div>
            ))}
          </div>

          <Panel title="By barber">
            {r.barbers.length === 0 ? <AdminEmpty title="No activity in this window" /> : (
              <TableWrap>
                <thead><tr><th className={th}>Barber</th><th className={th}>Cost / booking</th><th className={cn(th, 'text-right')}>Spend</th><th className={cn(th, 'text-right')}>Bookings</th><th className={cn(th, 'text-right')}>Repeat</th><th className={cn(th, 'text-right')}>Book</th><th className={cn(th, 'text-right')}>Call</th><th className={cn(th, 'text-right')}>Views</th><th className={th}>Status</th></tr></thead>
                <tbody>
                  {r.barbers.map((b) => {
                    const pct = b.costPerBookingCents != null ? Math.min(100, (b.costPerBookingCents / maxCpb) * 100) : 0;
                    const tPct = (target / maxCpb) * 100;
                    return (
                      <tr key={b.barberId ?? 'shop'} data-testid={`row-perf-${b.barberId ?? 'shop'}`}>
                        <td className={cn(td, 'font-medium text-bone')}>{b.barberName}</td>
                        <td className={cn(td, 'min-w-[200px]')}>
                          <div className="flex items-center gap-3">
                            <span className="w-16 font-mono text-[13px]">{b.costPerBookingCents != null ? money(b.costPerBookingCents, { cents: true }) : '—'}</span>
                            <div className="relative h-1.5 flex-1 bg-muted">
                              <div className={cn('absolute inset-y-0 left-0', b.status === 'on_target' ? 'bg-[hsl(140_35%_50%)]' : 'bg-oxblood')} style={{ width: `${pct}%` }} />
                              <div className="absolute -top-1 -bottom-1 w-px bg-gold" style={{ left: `${tPct}%` }} title="Target" />
                            </div>
                          </div>
                        </td>
                        <td className={cn(td, 'text-right font-mono')}>{money(b.spendCents)}</td>
                        <td className={cn(td, 'text-right font-mono text-gold')}>{b.bookings}</td>
                        <td className={cn(td, 'text-right font-mono')}>{b.repeatBookings}</td>
                        <td className={cn(td, 'text-right font-mono')}>{b.bookClicks}</td>
                        <td className={cn(td, 'text-right font-mono')}>{b.callClicks}</td>
                        <td className={cn(td, 'text-right font-mono')}>{b.landingViews}</td>
                        <td className={td}>{statusPill(b.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            )}
          </Panel>

          <div className="grid gap-6 xl:grid-cols-5">
            <Panel title="Landing page A/B" className="xl:col-span-3">
              {r.variants.length === 0 ? <AdminEmpty title="No landing views yet" body="Views appear once ad traffic hits a /l/ page." /> : (
                <TableWrap>
                  <thead><tr><th className={th}>Page</th><th className={th}>Variant</th><th className={cn(th, 'text-right')}>Views</th><th className={cn(th, 'text-right')}>Book</th><th className={cn(th, 'text-right')}>Call</th><th className={cn(th, 'text-right')}>Click rate</th></tr></thead>
                  <tbody>
                    {r.variants.map((v) => {
                      const peers = r.variants.filter((x) => x.landingPageSlug === v.landingPageSlug);
                      const best = peers.length > 1 && v.clickRate === Math.max(...peers.map((p) => p.clickRate)) && v.clickRate > 0;
                      return (
                        <tr key={v.landingPageSlug + v.variant} data-testid={`row-variant-${v.landingPageSlug}-${v.variant}`}>
                          <td className={cn(td, 'font-mono text-xs')}>/l/{v.landingPageSlug}</td>
                          <td className={td}><Pill tone={best ? 'gold' : 'muted'}>{v.variant}{best ? ' · leading' : ''}</Pill></td>
                          <td className={cn(td, 'text-right font-mono')}>{v.views}</td>
                          <td className={cn(td, 'text-right font-mono')}>{v.bookClicks}</td>
                          <td className={cn(td, 'text-right font-mono')}>{v.callClicks}</td>
                          <td className={cn(td, 'text-right font-mono text-bone')}>{(v.clickRate * 100).toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </TableWrap>
              )}
            </Panel>
            <Panel title="Live events" className="xl:col-span-2" actions={<span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(140_40%_55%)] animate-pulse" />30s</span>}>
              {events.isLoading ? <div className="p-5 space-y-2">{Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-8" />)}</div>
                : !events.data?.length ? <AdminEmpty title="Quiet so far" body="Call, book and landing events show up here." />
                : (
                  <ul className="max-h-[440px] overflow-y-auto divide-y divide-card-border">
                    {events.data.map((e) => {
                      const Icon = e.type === 'call_click' ? Phone : e.type === 'book_click' ? CalendarCheck : Eye;
                      return (
                        <li key={e.id} className="flex items-start gap-3 px-5 py-2.5 text-[13px]" data-testid={`row-event-${e.id}`}>
                          <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', e.type === 'landing_view' ? 'text-muted-foreground' : 'text-gold')} />
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between gap-2"><span className="text-bone">{e.type.replace('_', ' ')}{e.barberName && <span className="text-muted-foreground"> · {e.barberName}</span>}</span><span className="shrink-0 font-mono text-[11px] text-muted-foreground">{relTime(e.createdAt)}</span></div>
                            <div className="truncate font-mono text-[11px] text-muted-foreground">
                              {e.path}{e.variant && ` · ${e.variant}`}{e.utmSource && ` · ${e.utmSource}`}{e.utmCampaign && `/${e.utmCampaign}`}{e.gclid && ' · gclid'}{e.fbclid && ' · fbclid'}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
