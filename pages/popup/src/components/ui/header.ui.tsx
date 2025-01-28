import { Button, Icon } from '@extension/ui';
import { navigateTo } from '@src/utils';

export const Header = () => {
  const logo = chrome.runtime.getURL('popup/logo_vertical.svg');

  return (
    <header className="mb-4 flex items-center justify-between">
      <button onClick={() => navigateTo('https://briehq.com')} className="flex items-center gap-x-2">
        <img src={logo} className="size-5" alt="Brie" />
        <h1 className="text-xl font-semibold">brie</h1>
      </button>
      <div className="flex items-center">
        {/* <Button
            type="button"
            size="icon"
            variant="ghost"
            className="hover:bg-slate-50 dark:hover:text-black"
            onClick={() => navigateTo('https://app.briehq.com/settings?utm_source=extension')}>
            <Icon name="GitHubLogoIcon" size={20} className="size-4" />
          </Button> */}

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="hover:bg-slate-50 dark:hover:text-black"
          onClick={() => navigateTo('https://discord.gg/W9XZeWT8dM?utm_source=extension')}>
          <Icon name="DiscordLogoIcon" size={20} className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="hover:bg-slate-50 dark:hover:text-black"
          onClick={() => navigateTo('https://briehq.com?utm_source=extension')}>
          <Icon name="House" size={20} className="size-4" strokeWidth={1.5} />
        </Button>
      </div>
    </header>
  );
};
