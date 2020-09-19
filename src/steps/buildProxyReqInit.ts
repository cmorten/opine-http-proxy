import type { ProxyState } from "../createState.ts";
import { createRequestInit } from "../requestOptions.ts";

export function buildProxyReqInit(state: ProxyState) {
  const options = state.options;
  const req = state.src.req;
  const res = state.src.res;

  return Promise.resolve(createRequestInit(req, res, options))
    .then((resolvedReqInit) => {
      state.proxy.reqInit = resolvedReqInit;

      return state;
    });
}
