import { v4 as uuidv4 } from 'uuid';

import { traverseInformation } from '@extension/shared';

const restricted = ['briehq']; // 'extend.iife',  'kbmbnelnoppneadncmmkfikbcgmilbao'  Note: it blocks the logs
const invalidRecord = (entity: string) => restricted.some(word => entity.includes(word));

const tabRecordsMap = new Map<number, Map<string, any>>();

export type RecordType = 'events' | 'network' | 'console' | 'cookies';

export interface Record {
  recordType: RecordType;
  url?: string;
  requestBody?: {
    raw: { bytes: ArrayBuffer }[];
  };
  [key: string]: any;
}

export const getRecords = async (activeTabId: number): Promise<Record[]> => {
  return activeTabId && tabRecordsMap.has(activeTabId) ? Array.from(tabRecordsMap.get(activeTabId)!.values()) : [];
};

export const addOrMergeRecords = async (activeTabId: number, record: Record): Promise<void> => {
  if (!activeTabId) {
    console.log('activeTabId is null');
    return;
  }

  // if (record.recordType === 'console' && invalidRecord(record.stackTrace.parsed)) {
  //   console.log('record console', record);
  //   return;
  // }

  if (!tabRecordsMap.has(activeTabId)) {
    tabRecordsMap.set(activeTabId, new Map());
  }
  const recordsMap = tabRecordsMap.get(activeTabId)!;

  if (record.recordType === 'network' && invalidRecord(record?.url || '')) {
    return;
  }

  const uuid = uuidv4();

  if (record.recordType === 'events') {
    recordsMap.set(uuid, record);
    return;
  }

  if (record.recordType !== 'network') {
    recordsMap.set(uuid, { uuid, ...record });
    return;
  }

  const { url, ...others } = record;

  if (!url) {
    console.warn('[addOrMergeRecords] Missing URL for network record.');
    return;
  }

  if (!recordsMap.has(url)) {
    recordsMap.set(url, { url, uuid, ...others });
  }

  const recordData = recordsMap.get(url);

  for (const [key, value] of Object.entries(others)) {
    if (!recordData[key]) {
      recordData[key] = value;
    }

    if (key === 'requestBody' && recordData[key]?.raw) {
      const rawRequestBody = recordData[key].raw;

      if (!rawRequestBody.length) {
        recordData[key].parsed = null;
        continue;
      }

      const rawBytes = rawRequestBody[0].bytes;
      const byteArray = new Uint8Array(rawBytes);
      const decoder = new TextDecoder('utf-8');
      const decodedBody = decoder.decode(byteArray);

      try {
        recordData[key].parsed =
          typeof decodedBody !== 'string' && traverseInformation(JSON.parse(decodedBody), record?.url);
      } catch (e) {
        console.log('decodedBody', recordData[key], decodedBody);

        console.error('[addOrMergeRecords] Failed to parse JSON:', e);
      }
    }
  }
};
