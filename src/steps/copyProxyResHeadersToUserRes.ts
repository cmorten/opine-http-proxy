import { ProxyState } from "../createState.ts";

export function copyProxyResHeadersToUserRes(state: ProxyState) {
  const res = state.src.res;
  const rsp = state.proxy.res as Response;

  res.setStatus(rsp.status);

  Array.from(rsp.headers.entries())
    .forEach(([field, value]) => {
      if (field.toLowerCase() !== "transfer-encoding") {
        res.set(field, value);
      }
    });

  return Promise.resolve(state);
}
