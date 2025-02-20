import { Fragment, useState } from 'react';
import { format } from 'date-fns';

import { Alert, AlertDescription, AlertTitle, Button, Icon, Separator } from '@extension/ui';
import { useAppSelector, useDeleteSliceByIdMutation, useGetSlicesQuery, useUser } from '@extension/store';
import type { Pagination } from '@extension/shared';
import { AuthMethod, ITEMS_PER_PAGE } from '@extension/shared';

import { useSlicesCreatedToday } from '@src/hooks';
import { navigateTo } from '@src/utils';
import { CardSkeleton } from './card-skeleton.slice-history';

export const SlicesHistoryContent = ({ onBack }: { onBack: () => void }) => {
  const user = useUser();
  const totalSlicesCreatedToday = useSlicesCreatedToday();
  const filters = useAppSelector(state => state.slicesReducer.filters);
  const [pagination, setPagination] = useState<Pagination>({
    limit: 1,
    take: ITEMS_PER_PAGE,
  });

  const [deleteSliceByExternalId, { isLoading: isDeleteSliceLoading }] = useDeleteSliceByIdMutation();
  const { isLoading, isError, data: slices } = useGetSlicesQuery({ ...pagination, ...filters });

  const previewScreenshotUrl = attachments => attachments.find(a => a?.name === 'primary')?.preview;

  const onDeleteAll = () => {
    // Handle delete all logic
    console.log('All slices deleted');
  };
  const onDelete = async (externalId: string) => {
    await deleteSliceByExternalId(externalId);
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Icon name="ArrowLeftIcon" className="size-5" />
        </Button>

        {user.fields?.authMethod !== AuthMethod.GUEST && (
          <Button variant="link" size="sm" className="text-red-500" onClick={onDeleteAll}>
            Delete all
          </Button>
        )}
      </div>

      {/* Title and Description */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-x-1.5 text-base font-semibold">
          <Icon name="ImagesIcon" className="size-4" /> Slices History
        </h2>

        {user.fields?.authMethod === AuthMethod.GUEST && (
          <p className="text-muted-foreground text-sm font-medium text-red-500">
            {totalSlicesCreatedToday}/10 slices daily
          </p>
        )}
      </div>
      <p className="text-muted-foreground mb-4 text-xs">
        Slices are saved and automatically <span className="font-medium">deleted</span> after 7 days. There is a limit
        of 10 slices per day.
      </p>

      <Separator className="inset-x-0 h-px bg-gray-900/5 dark:bg-gray-800" />

      {isLoading && <CardSkeleton />}

      {!isLoading && !slices?.items?.length && (
        <Alert className="text-center">
          <AlertTitle className="text-[14px]">No slices created yet</AlertTitle>
          <AlertDescription className="text-[12px]">You have not created any slices.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !!slices?.items?.length && (
        <div className="mt-2 space-y-2">
          {slices.items.map((item, idx) => (
            <Fragment key={item.id}>
              <div className="flex items-center px-3">
                {previewScreenshotUrl(item.attachments) && (
                  <img
                    src={previewScreenshotUrl(item.attachments)}
                    alt="Slice Thumbnail"
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="mr-3 size-12 rounded-md object-cover"
                  />
                )}

                <div className="flex-1">
                  <button
                    className="max-w-[240px] truncate text-sm font-medium text-slate-700 hover:underline"
                    onClick={() => navigateTo(`https://app.briehq.com/s/${item.externalId}`)}>
                    {item.externalId}
                  </button>
                  <p className="text-muted-foreground text-xs">{format(item.createdAt, 'LLL dd, y hh:mm a')}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  disabled={isDeleteSliceLoading}
                  onClick={() => onDelete(item.externalId)}>
                  <Icon name="TrashIcon" className="size-3.5" />
                </Button>
              </div>

              {slices?.total - 1 !== idx && <Separator className="h-px bg-gray-900/5 dark:bg-gray-800" />}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
