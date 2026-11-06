import { useState } from 'react';
import { analyticsOptedOut, setAnalyticsOptOut } from '@/lib/analytics';

/** Privacy-page switch for Google Analytics on this browser. */
export function AnalyticsChoice() {
  const [off, setOff] = useState(analyticsOptedOut);
  const toggle = () => {
    setAnalyticsOptOut(!off);
    if (off) window.location.reload();
    else setOff(true);
  };
  return (
    <div className="not-prose my-6 flex flex-wrap items-center gap-4 border border-gold/25 bg-gold/5 px-5 py-4" data-testid="panel-analytics-choice">
      <p className="flex-1 text-sm text-bone/80" data-testid="text-analytics-status">
        Google Analytics is <strong className="text-bone">{off ? 'off' : 'on'}</strong> in this browser.
      </p>
      <button
        type="button"
        onClick={toggle}
        data-testid="button-analytics-toggle"
        className="inline-flex h-10 items-center rounded-sm border border-gold/60 px-5 text-sm font-semibold text-bone transition-colors hover:border-gold hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {off ? 'Turn it back on' : 'Turn it off'}
      </button>
    </div>
  );
}
