import { useEffect, useState } from 'react';

import { SlicesHistoryButton, SlicesHistoryContent } from './components/slices-history';
import { CaptureScreenshotGroup } from './components/capture';
import { Header, BetaNotifier, Skeleton } from './components/ui';

import { authTokensStorage, captureStateStorage, userUUIDStorage } from '@extension/storage';
import { useLoginGuestMutation } from '@extension/store';
import { useStorage } from '@extension/shared';
import { CLI_ENV, IS_DEV, IS_FIREFOX } from '@extension/env';

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
    return <Skeleton />;
  }

  return showSlicesHistory ? (
    <SlicesHistoryContent onBack={handleOnBack} />
  ) : (
    <>
      <Header />
      IS_FIREFOX: {IS_FIREFOX ? 'true' : 'false'}
      <br />
      IS_DEV: {IS_DEV ? 'true' : 'false'}
      <br />
      CLI_ENV: {CLI_ENV}
      <br />
      <CaptureScreenshotGroup />
      {captureState === 'idle' && <SlicesHistoryButton onClick={() => setShowSlicesHistory(true)} />}
      <BetaNotifier />
    </>
  );
};
