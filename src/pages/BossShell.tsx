import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import App from '../App';
import { PinGate } from '../components/PinGate';
import { isAuthenticated } from '../lib/auth';
import { isCloudEnabled } from '../lib/api';
import { pullCloudToLocal } from '../lib/sync';
import { useLanguage } from '../i18n/LanguageContext';

export const BossShell: React.FC = () => {
  const { t } = useLanguage();
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated('boss'));
  }, []);

  useEffect(() => {
    if (!authed) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const sync = async () => {
      if (!isCloudEnabled()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        await pullCloudToLocal();
        if (!cancelled) setSyncError(null);
      } catch (e) {
        if (!cancelled) {
          setSyncError(
            e instanceof Error ? e.message : t.auth.syncFailed,
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void sync();
    const id = window.setInterval(() => {
      void pullCloudToLocal().catch(() => undefined);
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [authed, t.auth.syncFailed]);

  if (!authed) {
    return (
      <div>
        <PinGate
          role="boss"
          title={t.auth.bossTitle}
          subtitle={t.auth.bossSubtitle}
          onSuccess={() => setAuthed(true)}
        />
        <p className="text-center text-sm text-gray-500 -mt-8 pb-8">
          <Link to="/staff" className="text-coffee-600 underline">
            {t.auth.staffLink}
          </Link>
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t.auth.syncing}
      </div>
    );
  }

  return (
    <>
      {syncError ? (
        <div className="bg-amber-50 text-amber-800 text-sm text-center px-3 py-2">
          {syncError}
        </div>
      ) : null}
      <App />
    </>
  );
};
