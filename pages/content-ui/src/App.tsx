import { useEffect, useState } from 'react';

import {
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DialogCopy,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
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

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js',
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
  },
  {
    value: 'remix',
    label: 'Remix',
  },
  {
    value: 'astro',
    label: 'Astro',
  },
];

export default function App() {
  const { toast } = useToast();
  const [screenshots, setScreenshots] = useState<{ name: string; image: string }[]>();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    console.log('content ui loaded');

    const handleDisplayModal = async event => {
      console.log('DISPLAY_MODAL Listener', event.detail);

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
    await captureStateStorage.setCaptureState('idle');
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
            <DialogCopy onClose={handleOnClose}>
              <div className="flex h-full">
                {/* Left Column */}
                <div className="flex w-[70%] flex-col justify-center bg-gray-50 px-4 pb-4 pt-5 sm:p-6">
                  {/* Content Section */}

                  <AnnotationContainer attachments={screenshots} />

                  {/* Footer Section */}
                  <div className="mt-4 flex justify-center">
                    <p className="text-xs text-gray-400 max-w-lg text-center select-none">
                      Brie also includes a fullscreen screenshot, along with browser and OS details, network requests,
                      and console logs to assist developers in debugging effectively.
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex w-[30%] flex-col justify-between px-4 pb-4 pt-5 sm:p-6">
                  {/* Dropdown and Comment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-x-4">
                      <h3 className="text-sm font-regular text-gray-600 whitespace-nowrap">Create a</h3>
                      {/* <select disabled className="mt-1 w-full rounded-lg border p-2">
                        <option>Link you can share</option>
                      </select> */}

                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between text-gray-600">
                            {value
                              ? frameworks.find(framework => framework.value === value)?.label
                              : 'Link you can share'}
                            <Icon name="ChevronsUpDown" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search integration..." />
                            <CommandList>
                              <CommandEmpty>No integration found.</CommandEmpty>
                              <CommandGroup>
                                {frameworks.map(framework => (
                                  <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={currentValue => {
                                      setValue(currentValue === value ? '' : currentValue);
                                      setOpen(false);
                                    }}>
                                    <Icon
                                      name="Check"
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        value === framework.value ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {framework.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <Textarea placeholder="Add a description" rows={10} />
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center justify-between">
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
                      className="w-[200px]"
                      onClick={() => {
                        toast({ variant: 'destructive', description: 'this ois an toast example' });
                      }}>
                      Create issue
                    </Button>
                  </div>
                </div>
              </div>
            </DialogCopy>
          </div>
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
