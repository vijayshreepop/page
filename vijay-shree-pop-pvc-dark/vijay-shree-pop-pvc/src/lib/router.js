import { useEffect, useState } from 'react';

const read = () => {
  const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(query)) };
};

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const href = (path, query) => {
  const q = new URLSearchParams(Object.entries(query || {}).filter(([, v]) => v !== '' && v != null)).toString();
  return `#${path}${q ? `?${q}` : ''}`;
};
export const go = (path, query) => { window.location.hash = href(path, query); };
export const replace = (path, query) => {
  window.history.replaceState(null, '', href(path, query));
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};
