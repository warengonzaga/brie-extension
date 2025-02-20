import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type AnnotationsStorage = BaseStorage<any> & {
  setAnnotations: (state: any) => Promise<void>;
  getAnnotations: () => Promise<any>;
};

const storage = createStorage<any>(
  'annotations-storage-key',
  [], // Default state is idle
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const annotationsStorage: AnnotationsStorage = {
  ...storage,

  setAnnotations: async (state: any) => {
    await storage.set(state);
  },

  getAnnotations: async () => {
    return await storage.get();
  },
};
