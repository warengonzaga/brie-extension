import { interceptCookies, interceptLocalStorage, interceptSessionStorage } from './application';
import { interceptConsole } from './console';
import { interceptEvents } from './events';
import { interceptFetch, interceptXHR } from './network';

// Initialize interceptors
interceptFetch();
interceptXHR();
interceptConsole();
interceptEvents();
interceptCookies();
interceptLocalStorage();
interceptSessionStorage();
