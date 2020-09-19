import type { ProxyState } from "../createState.ts";
import { asBuffer, asBufferOrString } from "../requestOptions.ts";

const encoder = new TextEncoder();

function getContentLength(body: any): number {
  if (body instanceof Uint8Array) {
    return body.byteLength;
  }

  return encoder.encode(body).byteLength;
}

export function prepareProxyReq(state: ProxyState) {
  const reqInit = state.proxy.reqInit;
  let body = reqInit.body;

  if (body) {
    body = state.options.reqAsBuffer ? asBuffer(body) : asBufferOrString(body);

    reqInit.body = body;
    (reqInit.headers as Headers).set(
      "content-length",
      String(getContentLength(body)),
    );

    if (state.options.reqBodyEncoding) {
      (reqInit.headers as Headers).append(
        "accept-charset",
        state.options.reqBodyEncoding,
      );
    }
  }

  return Promise.resolve(state);
}
