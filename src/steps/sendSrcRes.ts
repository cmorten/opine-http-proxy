import type { ProxyState } from "../createState.ts";

export function sendSrcRes(state: ProxyState) {
  if (state.options.stream) {
    state.src.res.send(state.proxy.res?.body);
  } else {
    state.src.res.send(state.proxy.resData);
  }

  return Promise.resolve(state);
}
