import '@src/Popup.css';
import { useEffect, useState, useCallback } from 'react';
import { Button, Icon, Alert, AlertTitle, AlertDescription } from '@extension/ui';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { captureStateStorage, captureTabStorage } from '@extension/storage';

const Popup = () => {
  const logo = 'popup/logo_vertical.svg';

  const navigateTo = useCallback(url => {
    chrome.tabs.create({ url });
  }, []);

  return (
    <div className="light relative bg-background p-4">
      <header className="mb-4 flex items-center justify-between">
        <button onClick={() => navigateTo('https://briehq.com')} className="flex items-center gap-x-2">
          <img src={chrome.runtime.getURL(logo)} className="size-5" alt="Brie" />
          <h1 className="text-xl font-semibold">brie</h1>
        </button>
        <div className="flex items-center">
          {false && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="hover:bg-slate-50 dark:hover:text-black"
              onClick={() => navigateTo('https://app.briehq.com/settings?utm_source=extension')}>
              <Icon name="GitHubLogoIcon" size={20} className="size-4" />
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="hover:bg-slate-50 dark:hover:text-black"
            onClick={() => navigateTo('https://app.briehq.com/settings?utm_source=extension')}>
            <Icon name="DiscordLogoIcon" size={20} className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="hover:bg-slate-50 dark:hover:text-black"
            onClick={() => navigateTo('https://app.briehq.com?utm_source=extension')}>
            <Icon name="House" size={20} className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      <CaptureScreenshotButton />
    </div>
  );
};

const CaptureScreenshotButton = () => {
  const [captureState, setCaptureState] = useState('idle');
  const [activeTab, setActiveTab] = useState({ id: null, url: '' });
  const [currentActiveTab, setCurrentActiveTab] = useState<number>();

  const updateCaptureState = useCallback(async state => {
    await captureStateStorage.setCaptureState(state);
    console.log('set state: ', state);

    setCaptureState(state);
  }, []);

  const updateActiveTab = useCallback(async tabId => {
    await captureTabStorage.setCaptureTabId(tabId);
    setActiveTab(prev => ({ ...prev, id: tabId }));
  }, []);

  useEffect(() => {
    const initializeState = async () => {
      const [state, tabId] = await Promise.all([
        captureStateStorage.getCaptureState(),
        captureTabStorage.getCaptureTabId(),
      ]);

      console.log('state, tabId', state, tabId);

      setCaptureState(state);
      setActiveTab(prev => ({ ...prev, id: tabId }));

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.url) {
        setActiveTab(prev => ({ ...prev, url: tabs[0].url }));
        setCurrentActiveTab(tabs[0].id);
      }
    };

    const handleEscapeKey = async event => {
      if (event.key === 'Escape' && captureState === 'capturing') {
        await updateCaptureState('idle');
        await updateActiveTab(null);
        console.log('Capture mode exited.');
      }
    };

    initializeState();
    window.addEventListener('keydown', handleEscapeKey);

    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [captureState, updateCaptureState, updateActiveTab]);

  const handleCaptureScreenshot = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (captureState === 'unsaved' && tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'CLOSE_MODAL' }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error stopping unsaved:', chrome.runtime.lastError.message);
        } else {
          console.log('Unsaved closed:', response);
        }
      });
    }

    if (['capturing', 'unsaved'].includes(captureState)) {
      console.log('state', captureState);

      await updateCaptureState('idle');
      await updateActiveTab(null);
      return;
    }

    if (tabs[0]?.id) {
      await updateCaptureState('capturing');
      await updateActiveTab(tabs[0].id);

      chrome.tabs.sendMessage(tabs[0].id, { action: 'START_SCREENSHOT' }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error starting capture:', chrome.runtime.lastError.message);
        } else {
          console.log('Capture started:', response);
        }
      });
    }

    window.close();
  };

  const handleGoToActiveTab = async () => {
    if (activeTab.id !== null) {
      await chrome.tabs.update(activeTab.id, { active: true });
      window.close();
    }
  };

  const handleOnDiscard = async () => {
    /**
     * @todo
     * if unsaved state,
     * then display a alert with same two option, discard or save
     */
    await updateCaptureState('idle');
    await updateActiveTab(null);
  };

  const isInternalPage = activeTab.url.startsWith('about:') || activeTab.url.startsWith('chrome:');

  if (isInternalPage)
    return (
      <Alert>
        <AlertDescription className="text-[12px]">Navigate to any website to start capturing bugs.</AlertDescription>
      </Alert>
    );

  if (captureState === 'unsaved' && currentActiveTab !== activeTab.id)
    return (
      <>
        <Alert>
          <AlertTitle className="text-[14px]">Save or discard your changes</AlertTitle>
          <AlertDescription className="text-[12px]">
            It seems like you have an unsaved draft open in another tab.
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex gap-x-2">
          <Button variant="secondary" type="button" size="sm" className="w-full" onClick={handleOnDiscard}>
            Discard
          </Button>
          <Button type="button" size="sm" className="w-full" onClick={handleGoToActiveTab}>
            Go to active tab
          </Button>
        </div>
      </>
    );

  return (
    <Button type="button" size="lg" className="w-full" onClick={handleCaptureScreenshot}>
      <Icon
        name={['capturing', 'unsaved'].includes(captureState) ? 'X' : 'Camera'}
        size={20}
        className="mr-2"
        strokeWidth={1.5}
      />
      <span>{['capturing', 'unsaved'].includes(captureState) ? 'Exit Capture Screenshot' : 'Capture Screenshot'}</span>
    </Button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
