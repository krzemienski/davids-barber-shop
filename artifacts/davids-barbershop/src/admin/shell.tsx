import { createContext, useContext, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth, useClerk, useUser } from '@clerk/react';
import { useGetAdminMe, getGetAdminMeQueryKey } from '@workspace/api-client-react';
import type { AdminUser } from '@workspace/api-client-react';
import { BarChart3, Scissors, Tag, Megaphone, CalendarCheck, Target, Settings, Users, LogOut, ExternalLink, Menu, X, ShieldAlert, Trash2, Loader2, KeyRound } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Wordmark, SkeletonBlock, ui } from '@/components/site';
import { basePath, errorStatus } from '@/lib/format';
import { usePageMeta } from '@/lib/meta';
import { cn } from '@/lib/utils';

const MeContext = createContext<AdminUser | null>(null);
export const useMe = () => useContext(MeContext);

const NAV = [
  { href: '/admin', label: 'Performance', icon: BarChart3 },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Target },
  { href: '/admin/landing-pages', label: 'Landing pages', icon: Megaphone },
  { href: '/admin/barbers', label: 'Barbers', icon: Scissors },
  { href: '/admin/services', label: 'Services', icon: Tag },
  { href: '/admin/settings', label: 'Site settings', icon: Settings },
  { href: '/admin/users', label: 'Staff access', icon: Users, owner: true },
];

function GateFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grain tile-floor flex min-h-[100dvh] items-center justify-center px-5">
      <div className="w-full max-w-md border border-gold/25 bg-ink/95 p-8 md:p-10 shadow-xl">
        <img src={`${basePath}/logo.svg`} alt="David's Barber Shop" className="h-14 w-auto" />
        <div className="pole-rule my-7" />
        {children}
      </div>
    </div>
  );
}

export function AdminGate({ children, ownerOnly }: { children: ReactNode; ownerOnly?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const me = useGetAdminMe({ query: { enabled: !!isSignedIn, retry: false, queryKey: getGetAdminMeQueryKey(), staleTime: 60_000 } });
  usePageMeta("Staff | David's Barber Shop", 'Staff area.');

  if (!isLoaded || (isSignedIn && me.isLoading)) {
    return (
      <div className="flex min-h-[100dvh] bg-background">
        <div className="hidden lg:block w-64 border-r border-border bg-sidebar p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <SkeletonBlock key={i} className="h-8" />)}</div>
        <div className="flex-1 p-10 space-y-6"><SkeletonBlock className="h-10 w-72" /><div className="grid grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-28" />)}</div><SkeletonBlock className="h-80" /></div>
      </div>
    );
  }
  if (!isSignedIn || errorStatus(me.error) === 401) {
    return (
      <GateFrame>
        <KeyRound className="h-6 w-6 text-gold" />
        <h1 className="mt-4 font-display text-3xl text-bone">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bookings, barbers, prices and ad performance live behind this door.</p>
        <Link href="/sign-in" className={cn(ui.btnBase, ui.btnSizes.md, ui.btnVariants.gold, 'mt-8 w-full')} data-testid="link-admin-sign-in">Sign in</Link>
        <Link href="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-gold" data-testid="link-admin-back">Back to the site</Link>
      </GateFrame>
    );
  }
  if (errorStatus(me.error) === 403 || (me.data && ownerOnly && me.data.role !== 'owner')) {
    const notStaff = errorStatus(me.error) === 403;
    return (
      <GateFrame>
        <ShieldAlert className="h-6 w-6 text-[hsl(354_60%_62%)]" />
        <h1 className="mt-4 font-display text-3xl text-bone">{notStaff ? 'No staff access' : 'Owners only'}</h1>
        <p className="mt-2 text-sm text-muted-foreground" data-testid="text-no-access">
          {notStaff
            ? <>This account{user?.primaryEmailAddress ? <> (<span className="text-bone">{user.primaryEmailAddress.emailAddress}</span>)</> : null} does not have staff access. Ask the shop owner to add your email.</>
            : 'Only owners can manage staff access.'}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {notStaff ? (
            <button onClick={() => signOut({ redirectUrl: basePath || '/' })} className={cn(ui.btnBase, ui.btnSizes.md, ui.btnVariants.gold)} data-testid="button-no-access-signout"><LogOut className="h-4 w-4" /> Sign out</button>
          ) : (
            <Link href="/admin" className={cn(ui.btnBase, ui.btnSizes.md, ui.btnVariants.gold)} data-testid="link-admin-home">Back to dashboard</Link>
          )}
          <Link href="/" className="text-center text-xs text-muted-foreground hover:text-gold">Back to the site</Link>
        </div>
      </GateFrame>
    );
  }
  if (me.isError || !me.data) {
    return (
      <GateFrame>
        <h1 className="font-display text-3xl text-bone">Could not reach the shop server</h1>
        <button onClick={() => me.refetch()} className={cn(ui.btnBase, ui.btnSizes.md, ui.btnVariants.outline, 'mt-6 w-full')} data-testid="button-admin-retry">Try again</button>
      </GateFrame>
    );
  }
  return <MeContext.Provider value={me.data}><AdminShell me={me.data}>{children}</AdminShell></MeContext.Provider>;
}

function AdminShell({ me, children }: { me: AdminUser; children: ReactNode }) {
  const [loc] = useLocation();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => !n.owner || me.role === 'owner');
  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((n) => {
        const active = n.href === '/admin' ? loc === '/admin' : loc.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)} data-testid={`link-admin-${n.label.toLowerCase().replace(/\s/g, '-')}`}
            className={cn('flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] transition-colors', active ? 'bg-gold/12 text-gold' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-bone')}>
            <n.icon className="h-4 w-4" />{n.label}
          </Link>
        );
      })}
    </nav>
  );
  const footer = (
    <div className="space-y-3 border-t border-sidebar-border pt-4 text-xs">
      <div className="truncate text-muted-foreground" data-testid="text-admin-email">{me.email}</div>
      <span className="inline-block rounded-sm border border-gold/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-gold">{me.role}</span>
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-gold" data-testid="link-view-site"><ExternalLink className="h-3.5 w-3.5" /> View site</Link>
        <button onClick={() => signOut({ redirectUrl: basePath || '/' })} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-gold" data-testid="button-sign-out"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
      </div>
    </div>
  );
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <aside className="hidden lg:flex sticky top-0 h-[100dvh] w-60 shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar p-5">
        <Link href="/admin"><Wordmark small /></Link>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>
      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4">
          <Wordmark small />
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" data-testid="button-admin-menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {open && <div className="lg:hidden border-b border-border bg-sidebar p-4 space-y-4">{nav}{footer}</div>}
        <main className="mx-auto max-w-7xl p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}

/* ---------- shared admin bits ---------- */
export function PageTitle({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-bone">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ children, className, title, actions }: { children: ReactNode; className?: string; title?: ReactNode; actions?: ReactNode }) {
  return (
    <section className={cn('border border-card-border bg-card', className)}>
      {title && <header className="flex items-center justify-between gap-3 border-b border-card-border px-5 py-3.5"><h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">{title}</h2>{actions}</header>}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-xs font-medium text-bone/85">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, testId }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; testId?: string }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-bone/85 cursor-pointer">
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
      {label}
    </label>
  );
}

export function Btn({ children, variant = 'gold', className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'outline' | 'ghost' }) {
  return (
    <button {...rest} className={cn(ui.btnBase, 'h-9 px-4 text-xs rounded-sm disabled:opacity-50 disabled:pointer-events-none', ui.btnVariants[variant], className)}>{children}</button>
  );
}

export function SaveBtn({ pending, children = 'Save', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
  return <Btn type="submit" disabled={pending} {...rest}>{pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{children}</Btn>;
}

export function Modal({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-h-[90dvh] overflow-y-auto border-gold/25 bg-card rounded-sm', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal text-bone">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDelete({ what, onConfirm, testId }: { what: string; onConfirm: () => void; testId?: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="p-1.5 text-muted-foreground hover:text-[hsl(354_60%_62%)] transition-colors" aria-label={`Delete ${what}`} data-testid={testId}><Trash2 className="h-4 w-4" /></button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-gold/25 bg-card rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-normal text-2xl">Delete {what}?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-sm" data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
          <AlertDialogAction className="rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm} data-testid="button-confirm-delete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Pill({ children, tone = 'muted' }: { children: ReactNode; tone?: 'gold' | 'red' | 'green' | 'muted' }) {
  const t = {
    gold: 'border-gold/40 text-gold bg-gold/10',
    red: 'border-[hsl(354_60%_50%/0.5)] text-[hsl(354_70%_68%)] bg-oxblood/20',
    green: 'border-[hsl(140_30%_45%/0.5)] text-[hsl(140_35%_65%)] bg-[hsl(140_30%_30%/0.15)]',
    muted: 'border-border text-muted-foreground',
  }[tone];
  return <span className={cn('inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10.5px] font-medium uppercase tracking-wider whitespace-nowrap', t)}>{children}</span>;
}

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full text-sm">{children}</table></div>;
}
export const th = 'px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap';
export const td = 'px-4 py-3 border-t border-card-border align-middle';

export function AdminEmpty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <Scissors className="mx-auto h-6 w-6 -rotate-45 text-gold/50" />
      <p className="mt-3 font-display text-xl text-bone">{title}</p>
      {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
