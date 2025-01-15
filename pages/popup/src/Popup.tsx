import '@src/Popup.css';

import { withErrorBoundary, withSuspense } from '@extension/shared';

import { CaptureScreenshotButton } from './components/capture';
import { Header, BetaNotifier } from './components/ui';

const Popup = () => {
  return (
    <div className="light relative bg-background px-5 pb-5 pt-4">
      <Header />

      <CaptureScreenshotButton />

      <BetaNotifier />
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
