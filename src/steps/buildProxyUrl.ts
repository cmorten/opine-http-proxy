import type { ProxyState } from "../createState.ts";
import { parseUrl } from "../requestOptions.ts";

export function buildProxyUrl(state: ProxyState) {
  let parsedUrl;

  if (state.options.memoizeUrl) {
    parsedUrl = state.options.memoizedUrl = state.options.memoizedUrl ||
      parseUrl(state);
  } else {
    parsedUrl = parseUrl(state);
  }

  state.proxy.url = parsedUrl;

  return Promise.resolve(state);
}
