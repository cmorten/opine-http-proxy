import { ProxyState } from "../createState.ts";

export function sendSrcRes(state: ProxyState) {
  state.src.res.send(state.proxy.resData);

  return Promise.resolve(state);
}
