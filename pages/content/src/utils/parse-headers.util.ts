// Utility to parse headers
export const parseHeaders = headers => {
  const parsedHeaders = {};
  headers.forEach((value, key) => {
    parsedHeaders[key] = value;
  });
  return parsedHeaders;
};
