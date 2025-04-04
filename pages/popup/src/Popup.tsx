import '@src/Popup.css';

import { withErrorBoundary, withSuspense } from '@extension/shared';
import { store, ReduxProvider } from '@extension/store';

import { PopupContent } from './popup-content';

const Popup = () => (
  <ReduxProvider store={store}>
    <div className="light relative bg-background px-5 pb-5 pt-4">
      <PopupContent />
    </div>
  </ReduxProvider>
);

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
