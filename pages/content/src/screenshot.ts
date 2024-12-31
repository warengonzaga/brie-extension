import html2canvas from 'html2canvas';

let startX: number, startY: number;
let isSelecting = false;
let selectionBox: HTMLDivElement;
let overlay: HTMLDivElement;
let dimensionLabel: HTMLDivElement;
let message: HTMLDivElement | null = null;
let loadingMessage: HTMLDivElement | null = null;
let cancelled = false; // Flag to track if the process is cancelled

// Helper: Create an overlay element
const createOverlay = () => {
  overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = '9999999';
  overlay.style.cursor = 'crosshair'; // Crosshair cursor
  overlay.setAttribute('id', 'screenshot-overlay');
  document.body.appendChild(overlay);
};

// Helper: Create the selection box element
const createSelectionBox = () => {
  selectionBox = document.createElement('div');
  selectionBox.style.position = 'absolute';
  selectionBox.style.backgroundColor = 'rgb(252, 229, 25, 0.3)';
  selectionBox.style.pointerEvents = 'none';
  selectionBox.style.zIndex = '10000000';
  selectionBox.style.border = '1px solid rgb(252, 229, 25, 0.7)';
  document.body.appendChild(selectionBox);
};

// Helper: Create the dimension label
const createDimensionLabel = () => {
  dimensionLabel = document.createElement('div');
  dimensionLabel.style.position = 'absolute';
  dimensionLabel.style.color = '#09080e';
  dimensionLabel.style.fontSize = '12px';
  dimensionLabel.style.fontWeight = '600';
  dimensionLabel.style.backgroundColor = 'rgb(252, 229, 25, 0.7)';
  dimensionLabel.style.padding = '2px 5px';
  dimensionLabel.style.borderRadius = '4px';
  dimensionLabel.style.pointerEvents = 'none';
  dimensionLabel.style.zIndex = '10000000';
  document.body.appendChild(dimensionLabel);
};

// Show the loading message while screenshot is preparing
const showLoadingMessage = () => {
  loadingMessage = document.createElement('div');
  loadingMessage.style.position = 'fixed';
  loadingMessage.style.top = '50%';
  loadingMessage.style.left = '50%';
  loadingMessage.style.transform = 'translate(-50%, -50%)';
  loadingMessage.style.color = '#09080e';
  loadingMessage.style.fontWeight = '600';
  loadingMessage.style.backgroundColor = 'rgb(252, 229, 25, 0.7)';
  loadingMessage.style.padding = '10px 20px';
  loadingMessage.style.borderRadius = '5px';
  loadingMessage.style.fontSize = '16px';
  loadingMessage.style.zIndex = '10000000';
  loadingMessage.textContent = 'Preparing Screenshot...';
  document.body.appendChild(loadingMessage);
};

// Remove the loading message
const hideLoadingMessage = () => {
  if (loadingMessage) {
    loadingMessage.remove();
    loadingMessage = null;
  }
};

// Update selection box during drag
const updateSelectionBox = (e: MouseEvent) => {
  if (!isSelecting) return;

  // Calculate width and height
  let width = e.pageX - startX;
  let height = e.pageY - startY;

  // Ensure the selection box doesn't exceed the window borders
  width = Math.min(width, window.innerWidth - Math.min(startX, e.pageX)); // Max width based on the window
  height = Math.min(height, window.innerHeight - Math.min(startY, e.pageY)); // Max height based on the window

  selectionBox.style.width = `${Math.abs(width)}px`;
  selectionBox.style.height = `${Math.abs(height)}px`;
  selectionBox.style.left = `${Math.min(startX, e.pageX)}px`;
  selectionBox.style.top = `${Math.min(startY, e.pageY)}px`;

  dimensionLabel.textContent = `W: ${Math.abs(width)}px, H: ${Math.abs(height)}px`;
  dimensionLabel.style.left = `${Math.min(startX, e.pageX)}px`;
  dimensionLabel.style.top = `${Math.min(startY, e.pageY) - 30}px`; // Added 5px gap
};

// Handle mouse movement for the instruction message
const onMouseMove = (e: MouseEvent) => {
  e.preventDefault(); // Prevent scrolling while dragging
  if (!message) return;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const messageWidth = message.offsetWidth;
  const messageHeight = message.offsetHeight;

  let posX = e.pageX + 15;
  let posY = e.pageY + 15;

  if (e.pageX + messageWidth + 30 > windowWidth) {
    posX = e.pageX - messageWidth - 15;
  }
  if (e.pageY + messageHeight + 30 > windowHeight) {
    posY = e.pageY - messageHeight - 15;
  }

  message.style.left = `${posX}px`;
  message.style.top = `${posY}px`;
};

// Start the screenshot selection process
const onMouseDown = (e: MouseEvent) => {
  isSelecting = true;
  startX = e.pageX;
  startY = e.pageY;

  // Disable body scroll when selection starts
  document.body.style.overflow = 'hidden'; // Disable scroll

  createSelectionBox();
  createDimensionLabel();

  document.addEventListener('mousemove', updateSelectionBox, { passive: false });
  document.addEventListener('mouseup', onMouseUp);

  if (message) {
    message.remove();
    message = null;
  }
};

// End the screenshot selection process
const onMouseUp = async (e: MouseEvent) => {
  if (cancelled) return; // If the process is cancelled, don't proceed

  isSelecting = false;

  const width = Math.abs(e.pageX - startX);
  const height = Math.abs(e.pageY - startY);

  cleanup(); // Cleanup after selection

  // Re-enable scroll after mouse release
  document.body.style.overflow = ''; // Restore original scroll behavior

  // Show loading message while preparing the screenshot
  showLoadingMessage();

  // Call the capture function
  await captureScreenshots(startX, startY, width, height);

  hideLoadingMessage(); // Hide loading message after processing

  document.removeEventListener('mousemove', updateSelectionBox);
  document.removeEventListener('mouseup', onMouseUp);
};

const saveAndNotify = ({ full, cropped }: { full: string; cropped: string | null }) => {
  const screenshots = [...(cropped ? [{ name: 'cropped', image: cropped }] : []), { name: 'full', image: full }];

  const event = new CustomEvent('DISPLAY_MODAL', { detail: { screenshots } });
  window.dispatchEvent(event);
};

// Capture screenshots
const captureScreenshots = async (startX: number, startY: number, width: number, height: number) => {
  try {
    if (loadingMessage) loadingMessage.style.display = 'none';

    // Step 1: Capture the full viewport screenshot (without red box)
    const scaleFactor = window.devicePixelRatio || 2; // Increase resolution by 2x (adjust based on quality needs)
    const fullPageCanvas = await html2canvas(document.body, {
      useCORS: true,
      scale: scaleFactor, // Increase the scale factor for higher resolution
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Step 2: Create the cropped version (without red box)
    const croppedCanvas = document.createElement('canvas');
    const croppedContext = croppedCanvas.getContext('2d');
    croppedCanvas.width = width * scaleFactor; // Scale the width for higher resolution
    croppedCanvas.height = height * scaleFactor; // Scale the height for higher resolution

    // Correct cropping offsets and alignment
    const adjustedStartX = startX - window.scrollX;
    const adjustedStartY = startY - window.scrollY;

    // Calculate the ratio based on the full-page canvas size and the visible viewport size
    const ratioX = fullPageCanvas.width / window.innerWidth;
    const ratioY = fullPageCanvas.height / window.innerHeight;

    croppedContext?.drawImage(
      fullPageCanvas, // Use the full-page canvas as the source
      adjustedStartX * ratioX, // Adjust X coordinate
      adjustedStartY * ratioY, // Adjust Y coordinate
      width * ratioX, // Adjust width with ratio
      height * ratioY, // Adjust height with ratio
      0, // X coordinate in the cropped canvas
      0, // Y coordinate in the cropped canvas
      width * scaleFactor, // Apply scale factor for better resolution
      height * scaleFactor, // Apply scale factor for better resolution
    );

    const croppedScreenshot =
      croppedCanvas.width && croppedCanvas.height ? croppedCanvas.toDataURL('image/png', 1.0) : null;

    if (loadingMessage) loadingMessage.style.display = 'block';

    // Step 3: Add the red box to the full screenshot (fullPageScreenshotData)
    const fullPageContext = fullPageCanvas.getContext('2d');
    fullPageContext?.beginPath();
    fullPageContext?.rect(adjustedStartX, adjustedStartY, width, height);
    fullPageContext!.lineWidth = 4;
    fullPageContext!.strokeStyle = 'red';
    fullPageContext?.stroke();

    const viewportScreenshot = fullPageCanvas.toDataURL('image/png', 1.0);

    // Step 4: Save and notify
    saveAndNotify({ full: viewportScreenshot, cropped: croppedScreenshot });

    // Step 5: Cleanup
    fullPageCanvas.remove();
    croppedCanvas.remove();
  } catch (error) {
    /**
     * @todo
     * capture the error and sent to us
     */
    console.error('Error during screenshot capturing:', error);
  }
};

// Show message that follows the cursor
const showInstructions = () => {
  message = document.createElement('div');
  message.style.position = 'absolute';
  message.style.background = 'rgb(252, 229, 25, 0.7)';
  message.style.color = '#09080e';
  message.style.padding = '10px';
  message.style.borderRadius = '5px';
  message.style.fontSize = '12px';
  message.style.fontWeight = '500';
  message.style.zIndex = '10000000';
  message.textContent = 'Click or drag to select area for screenshot';
  document.body.appendChild(message);

  document.addEventListener('mousemove', onMouseMove); // Move message with cursor
};

// Cleanup all elements and listeners
const cleanup = () => {
  cancelled = true; // Mark as cancelled when cleaning up
  if (overlay) overlay.remove();
  if (selectionBox) selectionBox.remove();
  if (dimensionLabel) dimensionLabel.remove();
  if (message) message.remove();
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('mouseup', onMouseUp);
};

// Handle keydown events for ESC press
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    cancelled = true; // Mark as cancelled when ESC is pressed
    cleanup(); // Cleanup on ESC

    // Notify Background on ESC
    chrome.runtime.sendMessage({ type: 'EXIT_CAPTURE' });
  }
};

// Attach event listeners for starting the process
export const startScreenshotCapture = () => {
  createOverlay();
  showInstructions();
  document.addEventListener('keydown', onKeyDown); // Listen for ESC key press
  document.addEventListener('mousedown', onMouseDown);
};
