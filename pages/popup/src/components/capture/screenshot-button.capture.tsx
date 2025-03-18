import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSlicesCreatedToday } from '@src/hooks';

import { useStorage } from '@extension/shared';
import { captureStateStorage, captureTabStorage } from '@extension/storage';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  cn,
  Icon,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@extension/ui';
import { useUser } from '@extension/store';
import { t } from '@extension/i18n';

const captureTypes = [
  {
    name: t('area'),
    slug: 'area',
    icon: 'SquareDashed',
  },
  { name: t('viewport'), slug: 'viewport', icon: 'AppWindowMac' },
  {
    name: t('fullPage'),
    slug: 'full-page',
    icon: 'RectangleVertical',
  },
];

export const CaptureScreenshotGroup = () => {
  const totalSlicesCreatedToday = useSlicesCreatedToday();
  const user = useUser();
  const captureState = useStorage(captureStateStorage);
  const captureTabId = useStorage(captureTabStorage);

  const [activeTab, setActiveTab] = useState({ id: null, url: '' });
  const [currentActiveTab, setCurrentActiveTab] = useState<number>();

  const isCaptureScreenshotDisabled = useMemo(
    () => totalSlicesCreatedToday > 10 && user?.fields?.authMethod === 'GUEST',
    [totalSlicesCreatedToday, user?.fields?.authMethod],
  );

  const isCaptureActive = useMemo(() => ['capturing', 'unsaved'].includes(captureState), [captureState]);

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

  const handleCaptureScreenshot = async (type?: 'full-page' | 'viewport' | 'area') => {
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

    if (tabs[0]?.id && type) {
      await updateCaptureState('capturing');
      await updateActiveTab(tabs[0].id);

      chrome.tabs.sendMessage(tabs[0].id, { action: 'START_SCREENSHOT', payload: { type } }, response => {
        if (chrome.runtime.lastError) {
          console.error('Error starting capture:', type, chrome.runtime.lastError.message);
        } else {
          console.log('Capture started:', type, response);
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

  if (isInternalPage && captureState !== 'unsaved' && currentActiveTab !== activeTab.id) {
    return (
      <Alert className="text-center">
        <AlertDescription className="text-[12px]">{t('navigateToWebsite')}</AlertDescription>
      </Alert>
    );
  }

  if (captureState === 'unsaved' && currentActiveTab !== activeTab.id) {
    return (
      <>
        <Alert className="text-center">
          <AlertTitle className="text-[14px]">{t('saveOrDiscardChanges')}</AlertTitle>
          <AlertDescription className="text-[12px]">
            {t('unsavedChanges')} <br /> {t('inAnotherTab')}
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex gap-x-2">
          <Button
            variant="secondary"
            type="button"
            size="sm"
            className="w-full"
            onClick={() => activeTab?.id && handleOnDiscard(activeTab.id)}>
            {t('discard')}
          </Button>
          <Button type="button" size="sm" className="w-full" onClick={handleGoToActiveTab}>
            {t('openActiveTab')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <RadioGroup
        className={cn('border-muted grid w-full gap-4 rounded-xl border bg-slate-100/20 p-2', {
          'grid-cols-3': !isCaptureActive,
        })}>
        {isCaptureActive ? (
          <button
            className="hover:bg-accent flex w-full items-center justify-center rounded-md border border-transparent py-4"
            onClick={() => handleCaptureScreenshot()}>
            <Icon name="X" size={20} strokeWidth={1.5} className="mr-1" />
            <span>{t('exitCaptureScreenshot')}</span>
          </button>
        ) : (
          <>
            {captureTypes.map(type => (
              <div key={type.slug}>
                <RadioGroupItem
                  value={type.slug}
                  id={type.slug}
                  className="peer sr-only"
                  onClick={() => handleCaptureScreenshot(type.slug)}
                  disabled={type.slug === 'full-page' || isCaptureScreenshotDisabled}
                />
                <Label
                  htmlFor={type.slug}
                  className={cn(
                    'flex flex-col items-center justify-between rounded-md border border-transparent py-3',
                    {
                      'text-slate-400': type.slug === 'full-page',
                      'hover:bg-accent hover:text-accent-foreground hover:border-slate-200 hover:cursor-pointer':
                        type.slug !== 'full-page',
                    },
                  )}>
                  <Icon name={type.icon} className="mb-3 size-5" strokeWidth={1.5} />

                  <span className="text-nowrap text-[11px]">{type.name}</span>
                </Label>
              </div>
            ))}
          </>
        )}
      </RadioGroup>

      {/* {isCaptureScreenshotDisabled && (
        <p>
          You’ve reached the issue limit for your plan. <a href="/pricing">Upgrade your plan</a> for unlimited issues.
        </p>
      )} */}

      {activeTab.id !== currentActiveTab && ['capturing', 'unsaved'].includes(captureState) && (
        <Button type="button" variant="link" size="sm" className="w-full" onClick={handleGoToActiveTab}>
          {t('openActiveTab')}
        </Button>
      )}
    </>
  );
};
