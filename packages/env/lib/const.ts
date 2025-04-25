export const IS_DEV = process.env['CLI_CEB_DEV'] === 'true';
export const CLI_CEB_ENV = process.env['CLI_CEB_ENV'];
export const IS_PROD = !IS_DEV;
export const IS_FIREFOX = process.env['CLI_CEB_FIREFOX'] === 'true';
export const IS_CI = process.env['CEB_CI'] === 'true';
export const CEB_NAME = process.env['CEB_NAME'];
export const CEB_API_BASE_URL = process.env['CEB_API_BASE_URL'];
export const CEB_APP_BASE_URL = process.env['CEB_APP_BASE_URL'];
