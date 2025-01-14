import { useEffect, useState } from 'react';

import {
  Button,
  DialogCopy,
  Icon,
  Textarea,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useToast,
} from '@extension/ui';
import { annotationsRedoStorage, annotationsStorage, captureStateStorage } from '@extension/storage';
import AnnotationContainer from './components/annotation/annotation-container';
import { useViewportSize } from './hooks';
import { createJsonFile } from './utils';

export default function App() {
  const { toast } = useToast();
  const { width } = useViewportSize();
  const [screenshots, setScreenshots] = useState<{ name: string; image: string }[]>();

  const [isMaximized, setIsMaximized] = useState(false);
  const [showRightSection, setShowRightSection] = useState(true);

  const handleToggleMaximize = () => setIsMaximized(!isMaximized);

  const handleToggleRightSection = () => setShowRightSection(!showRightSection);

  useEffect(() => {
    console.log('content ui loaded');

    const handleDisplayModal = async event => {
      console.log('DISPLAY_MODAL Listener', event.detail);
      console.log('event.detail.screenshots', event.detail.screenshots);

      setScreenshots(event.detail.screenshots); // Extract data from the event
      await captureStateStorage.setCaptureState('unsaved');
    };

    const handleOnCloseModal = () => {
      console.log('CLOSE_MODAL Listener');
      setScreenshots(null);

      annotationsStorage.setAnnotations([]);
      annotationsRedoStorage.setAnnotations([]);
    };

    // Attach event listener
    window.addEventListener('DISPLAY_MODAL', handleDisplayModal);
    window.addEventListener('CLOSE_MODAL', handleOnCloseModal);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('DISPLAY_MODAL', handleDisplayModal);
      window.removeEventListener('CLOSE_MODAL', handleOnCloseModal);
    };
  }, []);

  const handleOnCreate = async () => {
    // if success revert to idle state
    // await captureStateStorage.setCaptureState('idle');

    chrome.runtime.sendMessage({ type: 'GET_REQUESTS' }, response => {
      console.log('Received requests:', response?.requests);
      if (response?.requests?.length) {
        const jsonFile = createJsonFile(response.requests.flat(), 'requests.json');

        const formData = new FormData();
        formData.append('requests', jsonFile);

        if (screenshots) {
          formData.append('screenshots', screenshots);
        }

        // Further processing...
      } else {
        console.error('No requests received or requests are not an array');
      }
    });
  };

  const handleOnClose = async () => {
    setScreenshots(null);

    await captureStateStorage.setCaptureState('idle');

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
  };

  if (!screenshots?.length) return null;

  return (
    <TooltipProvider>
      <div className="light relative">
        <main className="flex-1 md:container md:max-w-screen-xl">
          <div className="flex items-center justify-between gap-2 rounded bg-white">
            <DialogCopy
              isMaximized={isMaximized}
              onClose={handleOnClose}
              actions={
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleToggleMaximize}
                    type="button"
                    className="size-6">
                    {isMaximized ? (
                      <Icon name="Minimize2Icon" className="size-3" strokeWidth="1.5" />
                    ) : (
                      <Icon name="Maximize2Icon" className="size-3" strokeWidth="1.5" />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleToggleRightSection}
                    type="button"
                    className="size-6">
                    {showRightSection ? (
                      <Icon name="PanelRightCloseIcon" className="size-3.5" strokeWidth="1.5" />
                    ) : (
                      <Icon name="PanelLeftCloseIcon" className="size-3.5" strokeWidth="1.5" />
                    )}
                  </Button>
                </>
              }>
              <div className="flex h-full flex-col md:flex-row">
                {/* Left Column */}

                <div
                  className={`flex ${
                    showRightSection ? 'sm:w-[70%]' : 'w-full'
                  } mt-10 flex-col justify-center bg-gray-50 px-4 pb-4 pt-5 sm:mt-0 sm:p-6`}>
                  {/* Content Section */}

                  <AnnotationContainer attachments={screenshots} />

                  {/* Footer Section */}
                  <div className="mt-4 flex justify-center">
                    <p className="max-w-lg select-none text-center text-xs text-gray-400">
                      Brie also includes a fullscreen screenshot, along with browser and OS details, network requests,
                      and console logs to assist developers in debugging effectively.
                    </p>
                  </div>

                  {!showRightSection && (
                    <Button
                      className="relative mt-2 w-full sm:absolute sm:bottom-6 sm:right-4 sm:mt-0 sm:w-[104px]"
                      onClick={() => {
                        toast({ variant: 'destructive', description: 'this ois an toast example' });

                        handleOnCreate();
                      }}>
                      Create
                    </Button>
                  )}
                </div>

                {showRightSection && (
                  <div className="flex flex-col justify-between px-4 pb-4 pt-5 sm:w-[30%] sm:p-6">
                    {/* Dropdown and Comment */}
                    <div className="space-y-4 sm:mt-8">
                      <Textarea placeholder="Add a description" rows={width < 500 ? 3 : 10} className="w-full" />

                      <small className="select-none text-xs text-gray-400">
                        This is the issue&apos;s description. Please provide detailed information.
                      </small>
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center">
                      <div className="mt-6 flex items-center justify-between gap-x-2">
                        <div className="flex gap-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" size="icon" variant="secondary" onClick={() => {}}>
                                <Icon name="Paperclip" className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" sideOffset={14}>
                              Attach file
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button type="button" size="icon" variant="secondary" onClick={() => {}}>
                                <Icon name="Folder" className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" sideOffset={14}>
                              Add to folder
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => {
                            toast({ variant: 'destructive', description: 'this ois an toast example' });
                            handleOnCreate();
                          }}>
                          Create
                        </Button>
                      </div>
                      <small className="select-none text-center text-xs text-gray-400">
                        This will create a link you can share.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </DialogCopy>
          </div>
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
