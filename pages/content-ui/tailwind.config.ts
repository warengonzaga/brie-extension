import baseConfig from '@extension/tailwindcss-config';
import { withUI } from '@extension/ui';

export default withUI({
  ...baseConfig,
  /**
   *  @todo test if needed and remove
   */
  content: ['src/**/*.tsx'],
});
