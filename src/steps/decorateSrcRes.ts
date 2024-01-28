import type { ProxyState } from "../createState.ts";
import { asBuffer } from "../requestOptions.ts";

export function decorateSrcRes(state: ProxyState) {
  const resolverFn = state.options.srcResDecorator;

  if (!resolverFn) {
    return Promise.resolve(state);
  }

  const req = state.src.req;
  const res = state.src.res;
  const proxyRes = state.proxy.res;
  const proxyResData = state.proxy.resData;

  if (res.status === 304) {
    return Promise.resolve(state);
  }

  return Promise
    .resolve(resolverFn(req, res, proxyRes as Response, proxyResData))
    .then((resolvedResData) => {
      state.proxy.resData = asBuffer(resolvedResData);

      return state;
    });
}
