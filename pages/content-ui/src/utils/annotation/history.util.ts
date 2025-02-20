import { annotationsRedoStorage, annotationsStorage } from '@extension/storage';

export const saveHistory = async (currentState: any) => {
  const stateHistory = (await annotationsStorage.getAnnotations()) || [];

  stateHistory.push(currentState);
  await annotationsStorage.setAnnotations(stateHistory);

  // Clear the redo stack on new state save
  await annotationsRedoStorage.setAnnotations([]);
};

export const undoAnnotation = async () => {
  const stateHistory = (await annotationsStorage.getAnnotations()) || [];

  console.log('stateHistory', stateHistory);

  if (stateHistory.length > 1) {
    const redoStack = (await annotationsStorage.getAnnotations()) || [];

    redoStack.push(stateHistory.pop()); // Move the current state to the redo stack
    await annotationsStorage.setAnnotations(stateHistory);
    await annotationsRedoStorage.setAnnotations(redoStack);

    return stateHistory[stateHistory.length - 1]; // Return the previous state
  }

  return null; // No more states to undo
};

export const redoAnnotation = async () => {
  const redoStack = (await annotationsRedoStorage.getAnnotations()) || [];
  const stateHistory = (await annotationsStorage.getAnnotations()) || [];

  if (redoStack.length > 0) {
    const restoredState = redoStack.pop(); // Get the last state from the redo stack
    stateHistory.push(restoredState); // Move it back to the history

    await annotationsStorage.setAnnotations(stateHistory);
    await annotationsRedoStorage.setAnnotations(redoStack);

    return restoredState; // Return the restored state
  }

  return null; // No more states to redo
};
