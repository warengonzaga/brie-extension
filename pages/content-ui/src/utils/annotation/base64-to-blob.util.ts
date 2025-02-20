export const base64ToBlob = (data: string, type = '') => {
  // Decode base64 string
  const byteCharacters = atob(data);

  // Create byte array
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  // Convert byte array to Blob
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: type });
};
