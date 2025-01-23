import { Fragment } from 'react';

import { Button, Icon, Separator } from '@extension/ui';
import { navigateTo } from '@src/utils';
import { useAppSelector } from '@extension/store';

export const SlicesHistoryContent = ({
  onBack,
  onDelete,
  onDeleteAll,
}: {
  onBack: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}) => {
  const filters = useAppSelector(state => state.issuesReducer.filters);

  return (
    <div>
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Icon name="ArrowLeftIcon" className="size-5" />
        </Button>

        <Button variant="link" size="sm" className="text-red-500" onClick={onDeleteAll}>
          Delete all
        </Button>
      </div>

      {/* Title and Description */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-x-1.5 text-base font-semibold">
          <Icon name="ImagesIcon" className="size-4" /> Slices History
        </h2>
        <p className="text-muted-foreground text-sm font-medium">10/10 slices daily</p>
      </div>
      <p className="text-muted-foreground mb-4 text-xs">
        Slices are saved and automatically <span className="font-medium">deleted</span> after 7 days. There is a limit
        of 10 slices per day.
      </p>

      <Separator className="inset-x-0 h-px bg-gray-900/5 dark:bg-gray-800" />

      {JSON.stringify(filters, null, 2)}

      {/* Cards */}
      <div className="mt-2 space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 10, 88, 18].map((item, idx) => (
          <Fragment key={item}>
            <div className="flex items-center px-3">
              <img src="https://placehold.co/600x400" alt="Slice Thumbnail" className="mr-3 size-12 rounded-md" />
              <div className="flex-1">
                <button
                  className="max-w-[240px] truncate text-sm font-medium text-slate-700 hover:underline"
                  onClick={() => navigateTo('https://placehold.co/600x400')}>
                  https://placehold.co/600x400https://placehold.co/600x400
                </button>
                <p className="text-muted-foreground text-xs">01/01/2025 10:00 PM</p>
              </div>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete('1')}>
                <Icon name="TrashIcon" className="size-3.5" />
              </Button>
            </div>

            {[1, 2, 3].length - 1 !== idx && <Separator className="h-px bg-gray-900/5 dark:bg-gray-800" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
