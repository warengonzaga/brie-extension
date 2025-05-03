export const Skeleton = () => <div className="relative mt-3">
<div className="items-center space-y-6 md:flex md:justify-between md:space-x-4 md:space-y-0">
  <div className="flex justify-between">
    <Skeleton className="h-8 w-[120px]" />

    <div className="flex space-x-2">
      <Skeleton className="size-8" />
      <Skeleton className="size-8" />
    </div>
  </div>

  <div className="grid space-y-3">
    <Skeleton className="size-9 w-full rounded-lg" />

    <div className="space-y-1.5">
      <Skeleton className="m-auto h-3 w-[180px]" />
      <Skeleton className="m-auto h-3 w-[250px]" />
    </div>
  </div>
</div>
</div>
