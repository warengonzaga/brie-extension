import { useEffect, useState } from 'react';

import { t } from '@extension/i18n';
import { userUUIDStorage } from '@extension/storage';

export const BetaNotifier = () => {
  const [uuid, setUUID] = useState<string | null>();

  useEffect(() => {
    const getUUID = async () => {
      const uuid = await userUUIDStorage.get();

      setUUID(uuid);
    };

    getUUID();
  }, []);

  return (
    <div className="mt-4 text-center text-[10px] font-normal text-slate-600">
      {t('inBeta')}{' '}
      <a
        href="https://go.brie.io/discord?utm_source=extension"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-slate-900">
        {t('reportBugsOrRequestFeatures')}
      </a>
      <br />
      <span>UUID: {uuid}</span>
    </div>
  );
};
