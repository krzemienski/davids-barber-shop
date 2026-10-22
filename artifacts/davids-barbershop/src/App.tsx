import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from '@/pages/home';
import LandingPage from '@/pages/landing';
import { BarbersPage, BarberProfilePage, ServicesPage, OurStoryPage, GalleryPage, VisitPage, PrivacyPage, NotFoundPage } from '@/pages/public-pages';
import { AdminGate } from '@/admin/shell';
import PerformancePage from '@/admin/performance';
import AdminBarbersPage from '@/admin/barbers';
import { AdminServicesPage, AdminLandingPagesPage, AdminBookingsPage, AdminCampaignsPage, AdminSettingsPage, AdminUsersPage } from '@/admin/crud';
import { captureAttribution } from '@/lib/tracking';
import { usePageMeta } from '@/lib/meta';

captureAttribution();

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } });

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#C8A464',
    colorForeground: '#EDE4D3',
    colorMutedForeground: '#A89C88',
    colorDanger: '#D9545E',
    colorBackground: '#15120F',
    colorInput: '#0E0C0A',
    colorInputForeground: '#EDE4D3',
    colorNeutral: '#C8B898',
    fontFamily: "'Poppins', sans-serif",
    borderRadius: '0.25rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#15120F] border border-[#C8A464]/30 rounded-sm w-[440px] max-w-full overflow-hidden shadow-2xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: "!font-['Playfair_Display'] !text-3xl !font-normal !text-[#EDE4D3]",
    headerSubtitle: '!text-[#A89C88]',
    socialButtonsBlockButtonText: '!text-[#EDE4D3] !font-medium',
    formFieldLabel: '!text-[#D9CDB6] !text-xs',
    footerActionLink: '!text-[#C8A464] !font-semibold',
    footerActionText: '!text-[#A89C88]',
    dividerText: '!text-[#A89C88]',
    identityPreviewEditButton: '!text-[#C8A464]',
    formFieldSuccessText: '!text-[#8FC79A]',
    alertText: '!text-[#EDE4D3]',
    logoBox: '!h-14 !justify-start',
    logoImage: '!h-14 !w-auto',
    socialButtonsBlockButton: '!bg-[#0E0C0A] !border !border-[#3A3127] !rounded-sm',
    formButtonPrimary: '!bg-[#C8A464] !text-[#0E0C0A] !font-semibold !rounded-sm !shadow-none !normal-case',
    formFieldInput: '!bg-[#0E0C0A] !border-[#3A3127] !text-[#EDE4D3] !rounded-sm',
    footerAction: '!bg-transparent',
    dividerLine: '!bg-[#3A3127]',
    alert: '!bg-[#5C1D24]/40 !border-[#8A2E38]',
    otpCodeFieldInput: '!bg-[#0E0C0A] !border-[#3A3127] !text-[#EDE4D3]',
    formFieldRow: '',
    main: '',
  },
};

function AuthFrame({ children }: { children: ReactNode }) {
  usePageMeta("Staff sign in | David's Barber Shop", 'Staff sign in.', { noindex: true });
  return (
    <div className="grain tile-floor relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12">
      <div aria-hidden className="pole-rule absolute inset-x-0 top-0" />
      <p className="mb-6 text-[11px] uppercase tracking-[0.35em] text-gold">Staff entrance</p>
      {children}
      <Link href="/" className="mt-8 text-xs text-muted-foreground hover:text-gold" data-testid="link-auth-back">Back to the shop</Link>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthFrame>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={`${basePath}/admin`} fallbackRedirectUrl={`${basePath}/admin`} />
    </AuthFrame>
  );
}

function SignUpPage() {
  return (
    <AuthFrame>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={`${basePath}/admin`} fallbackRedirectUrl={`${basePath}/admin`} />
    </AuthFrame>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// The previous site was one page with #anchors; send old bookmarks and links to the matching page.
const LEGACY_ANCHORS: Record<string, string> = {
  'about-us': '/our-story',
  'our-services': '/services',
  'price-list': '/services',
};

function LegacyAnchorRedirect() {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (location !== '/') return;
    const target = LEGACY_ANCHORS[window.location.hash.slice(1).toLowerCase()];
    if (target) setLocation(target, { replace: true });
  }, [location, setLocation]);
  return null;
}

const admin = (C: () => ReactNode, ownerOnly?: boolean) => () => <AdminGate ownerOnly={ownerOnly}><C /></AdminGate>;

function Router() {
  return (
    <RoutedErrorBoundary>
      <LegacyAnchorRedirect />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/barbers" component={BarbersPage} />
        <Route path="/barbers/:slug" component={BarberProfilePage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/our-story" component={OurStoryPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/visit" component={VisitPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/l/:slug" component={LandingPage} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/admin" component={admin(PerformancePage)} />
        <Route path="/admin/barbers" component={admin(AdminBarbersPage)} />
        <Route path="/admin/services" component={admin(AdminServicesPage)} />
        <Route path="/admin/landing-pages" component={admin(AdminLandingPagesPage)} />
        <Route path="/admin/bookings" component={admin(AdminBookingsPage)} />
        <Route path="/admin/campaigns" component={admin(AdminCampaignsPage)} />
        <Route path="/admin/settings" component={admin(AdminSettingsPage)} />
        <Route path="/admin/users" component={admin(AdminUsersPage, true)} />
        <Route component={() => <NotFoundPage />} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Staff sign in',
            subtitle: "Bookings, barbers and ad performance for David's",
          },
        },
        signUp: {
          start: {
            title: 'Create your staff account',
            subtitle: 'Use the email the owner added to the staff list',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
