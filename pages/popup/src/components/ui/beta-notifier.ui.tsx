import { useEffect, useState } from 'react';

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
      In beta.{' '}
      <a
        href="https://discord.gg/W9XZeWT8dM?utm_source=extension"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-slate-900">
        Report bugs or request features.
      </a>
      <br />
      <span>UUID: {uuid}</span>
    </div>
  );
};
