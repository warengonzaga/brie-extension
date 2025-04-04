import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type AnnotationsRedoStorage = BaseStorage<any> & {
  setAnnotations: (state: any) => Promise<void>;
  getAnnotations: () => Promise<any>;
};

const storage = createStorage<any>(
  'annotations-redo-storage-key',
  [], // Default state is idle
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const annotationsRedoStorage: AnnotationsRedoStorage = {
  ...storage,

  setAnnotations: async (state: any) => {
    await storage.set(state);
  },

  getAnnotations: async () => {
    return await storage.get();
  },
};
