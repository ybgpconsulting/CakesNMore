export const PRODUCTION_ORIGIN = 'https://cakesnmorenoida.in';

export function getProductionUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${PRODUCTION_ORIGIN}${path === '/' ? '/' : path}`;
}