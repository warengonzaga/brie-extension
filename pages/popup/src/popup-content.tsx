import { useEffect, useState } from 'react';

import { SlicesHistoryButton, SlicesHistoryContent } from './components/slices-history';
import { CaptureScreenshotGroup } from './components/capture';
import { Header, BetaNotifier } from './components/ui';

import { authTokensStorage, captureStateStorage, userUUIDStorage } from '@extension/storage';
import { useLoginGuestMutation } from '@extension/store';
import { APP_NAME, BASE_URL, useStorage } from '@extension/shared';
import { Skeleton } from '@extension/ui';

export const PopupContent = () => {
  const captureState = useStorage(captureStateStorage);
  const tokens = useStorage(authTokensStorage);
  const uuid = useStorage(userUUIDStorage);

  const [showSlicesHistory, setShowSlicesHistory] = useState(false);
  const [loginGuest, { isLoading }] = useLoginGuestMutation();

  useEffect(() => {
    const initialGuestLogin = async () => {
      if (!tokens?.accessToken && uuid) {
        loginGuest({ uuid });
      }
    };

    initialGuestLogin();
  }, [loginGuest, tokens?.accessToken, uuid]);

  const handleOnBack = () => setShowSlicesHistory(false);

  if (isLoading) {
    return (
      <div className="relative mt-3">
        <div className="items-center space-y-6 md:flex md:justify-between md:space-x-4 md:space-y-0">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-[120px]" />

            <div className="flex space-x-2">
              <Skeleton className="size-8" />
              <Skeleton className="size-8" />
            </div>
          </div>

          <div className="grid space-y-3">
            <Skeleton className="size-9 w-full rounded-lg" />

            <div className="space-y-1.5">
              <Skeleton className="m-auto h-3 w-[180px]" />
              <Skeleton className="m-auto h-3 w-[250px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return showSlicesHistory ? (
    <SlicesHistoryContent onBack={handleOnBack} />
  ) : (
    <>
      <Header />
      <CaptureScreenshotGroup />
      {captureState === 'idle' && <SlicesHistoryButton onClick={() => setShowSlicesHistory(true)} />}
      <BetaNotifier />
    </>
  );
};
