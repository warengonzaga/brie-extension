import { v4 as uuidv4 } from 'uuid';

const restricted = ['extend.iife', 'briehq', 'fhfdkpfdkimboffigpggibbgggeimpfd'];
const invalidRecord = (entity: string) => restricted.some(word => entity.includes(word));

const recordsMap = new Map<string, any>();

export type RecordType = 'events' | 'network' | 'console' | 'cookies';

export interface Record {
  recordType: RecordType;
  url?: string;
  requestBody?: {
    raw: { bytes: ArrayBuffer }[];
  };
  [key: string]: any;
}

export const getRecords = () => Array.from(recordsMap.values());

export const addOrMergeRecords = (record: Record): void => {
  if (record.recordType === 'console' && invalidRecord(record.stackTrace.parsed)) {
    return;
  }

  if (record.recordType === 'network' && invalidRecord(record?.url || '')) {
    console.log('record', record);

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
      const rowRequestBody = recordData[key].raw;

      if (!rowRequestBody.length) {
        recordData[key].parsed = null;
        continue;
      }

      const rawBytes = rowRequestBody[0].bytes;
      const byteArray = new Uint8Array(rawBytes);
      const decoder = new TextDecoder('utf-8');
      const decodedBody = decoder.decode(byteArray);

      try {
        recordData[key].parsed = JSON.parse(decodedBody);
      } catch (e) {
        console.error('[addOrMergeRecords] Failed to parse JSON:', e);
      }
    }
  }
};
