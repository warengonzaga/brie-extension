import { Button, Icon } from '@extension/ui';

export const SlicesHistoryButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="mt-4 flex items-center justify-center">
      <Button type="button" variant="ghost" size="sm" className="h-6 gap-x-1.5 text-slate-600" onClick={onClick}>
        Slices history <Icon name="ImagesIcon" className="size-4" />
      </Button>
    </div>
  );
};
