import { useCallback, useEffect, useState } from 'react';

import { useStorage } from '@extension/shared';
import { captureStateStorage, captureTabStorage } from '@extension/storage';
import { Alert, AlertDescription, AlertTitle, Button, Icon } from '@extension/ui';

export const CaptureScreenshotButton = () => {
  const captureState = useStorage(captureStateStorage);
  const captureTabId = useStorage(captureTabStorage);

  const [activeTab, setActiveTab] = useState({ id: null, url: '' });
  const [currentActiveTab, setCurrentActiveTab] = useState<number>();

  useEffect(() => {
    const initializeState = async () => {
      setActiveTab(prev => ({ ...prev, id: captureTabId }));

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
      }
    };

    initializeState();
    window.addEventListener('keydown', handleEscapeKey);

    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [captureState, captureTabId]);

  const updateCaptureState = useCallback(async state => {
    await captureStateStorage.setCaptureState(state);
  }, []);

  const updateActiveTab = useCallback(async (tabId: number) => {
    await captureTabStorage.setCaptureTabId(tabId);
    setActiveTab(prev => ({ ...prev, id: tabId }));
  }, []);

  const handleCaptureScreenshot = async () => {
    if (captureState === 'unsaved' && activeTab?.id) {
      handleOnDiscard(activeTab?.id);
    }

    if (['capturing', 'unsaved'].includes(captureState)) {
      chrome.tabs.sendMessage(activeTab?.id, { action: 'EXIT_CAPTURE' }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error stopping unsaved:', chrome.runtime.lastError.message);
        } else {
          console.log('Unsaved closed:', response);
        }
      });

      await updateCaptureState('idle');
      await updateActiveTab(null);

      return;
    }

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

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
    if (activeTab.id) {
      await chrome.tabs.update(activeTab.id, { active: true });
      window.close();
    }
  };

  const handleOnDiscard = async (activeTabId: number) => {
    /**
     * @todo
     * if unsaved state,
     * then display a alert with same two option, discard or save
     */
    await updateCaptureState('idle');
    await updateActiveTab(null);

    chrome.tabs.sendMessage(activeTabId, { action: 'CLOSE_MODAL' }, response => {
      if (chrome.runtime.lastError) {
        console.error('Error stopping unsaved:', chrome.runtime.lastError.message);
      } else {
        console.log('Unsaved closed:', response);
      }
    });
  };

  const isInternalPage = activeTab.url.startsWith('about:') || activeTab.url.startsWith('chrome:');

  if (isInternalPage) {
    return (
      <Alert className="text-center">
        <AlertDescription className="text-[12px]">Navigate to any website to start capturing bugs.</AlertDescription>
      </Alert>
    );
  }

  if (captureState === 'unsaved' && currentActiveTab !== activeTab.id) {
    return (
      <>
        <Alert className="text-center">
          <AlertTitle className="text-[14px]">Save or discard your changes</AlertTitle>
          <AlertDescription className="text-[12px]">
            It seems like you have an unsaved draft open in another tab.
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex gap-x-2">
          <Button
            variant="secondary"
            type="button"
            size="sm"
            className="w-full"
            onClick={() => activeTab?.id && handleOnDiscard(activeTab.id)}>
            Discard
          </Button>
          <Button type="button" size="sm" className="w-full" onClick={handleGoToActiveTab}>
            Go to active tab
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Button type="button" size="lg" className="w-full" onClick={handleCaptureScreenshot}>
        <Icon
          name={['capturing', 'unsaved'].includes(captureState) ? 'X' : 'Camera'}
          size={20}
          className="mr-2"
          strokeWidth={1.5}
        />
        <span>
          {['capturing', 'unsaved'].includes(captureState) ? 'Exit Capture Screenshot' : 'Capture Screenshot'}
        </span>
      </Button>

      {activeTab.id !== currentActiveTab && ['capturing', 'unsaved'].includes(captureState) && (
        <Button type="button" variant="link" size="sm" className="w-full" onClick={handleGoToActiveTab}>
          Go to active tab
        </Button>
      )}
    </>
  );
};
