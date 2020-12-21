import { read } from "../deps.ts";
import type { ProxyState } from "./createState.ts";
import type { ProxyOptions } from "./resolveOptions.ts";

export function parseUrl(state: ProxyState) {
  const req = state.src.req;
  const options = state.options;

  let url = state.params.url;

  if (typeof url === "function") {
    url = url(req);
  }
  if (url instanceof URL) {
    url = url.toString();
  }

  const secure = typeof options.secure !== "undefined"
    ? options.secure
    : url.startsWith("https:")
    ? true
    : req.secure;

  const protocol = secure ? "https" : "http";

  if (!/http(s)?:\/\//.test(url)) {
    url = `${protocol}://${url}`;
  } else {
    url = `${protocol}://${url.split("://")[1]}`;
  }

  url = `${url.replace(/\/$/, "")}${req.url}`;

  return new URL(url);
}

function extendHeaders(
  baseHeaders: HeadersInit,
  reqHeaders: Headers,
  ignoreHeaders: string[],
): Headers {
  const headers = new Headers(baseHeaders);

  if (!reqHeaders) {
    return headers;
  }

  reqHeaders.forEach((value, field) => {
    if (!ignoreHeaders.includes(field.toLowerCase())) {
      headers.set(field, value);
    }
  });

  return headers;
}

const parseRawBody = (body: any) => body;

async function getBody(req: any, res: any) {
  if (req.parsedBody) {
    return req.parsedBody;
  }

  return new Promise((resolve) =>
    read(
      req,
      res,
      resolve,
      parseRawBody,
      { encoding: null, verify: false, inflate: true },
    )
  ).then((err?: any) => {
    if (err) throw err;

    return req.parsedBody;
  });
}

async function reqBody(
  req: Request,
  res: Response,
  options: ProxyOptions,
) {
  return options.parseReqBody ? await getBody(req, res) : null;
}

function reqHeaders(req: Request, options: ProxyOptions): Headers {
  const baseHeaders: HeadersInit = options.headers || {};
  const ignoreHeaders = ["connection", "content-length"];

  if (!options.preserveHostHeader) {
    ignoreHeaders.push("host");
  }

  const headers = extendHeaders(baseHeaders, req.headers, ignoreHeaders);
  headers.set("connection", "close");

  return headers;
}

export async function createRequestInit(
  req: Request,
  res: Response,
  options: ProxyOptions,
): Promise<RequestInit> {
  const body = await reqBody(req, res, options);

  return {
    body,
    cache: options.cache,
    credentials: options.credentials,
    integrity: options.integrity,
    keepalive: options.keepalive,
    mode: options.mode || "cors",
    redirect: options.redirect,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy,
    signal: options.signal,
    headers: reqHeaders(req, options),
    method: options.method || req.method,
  };
}

const encoder = new TextEncoder();

export function asBuffer(body: any) {
  if (typeof body === "object" && !(body instanceof Uint8Array)) {
    return encoder.encode(JSON.stringify(body));
  } else if (typeof body === "string") {
    return encoder.encode(body);
  }

  return body;
}

export function asBufferOrString(body: any) {
  if (typeof body === "object" && !(body instanceof Uint8Array)) {
    return JSON.stringify(body);
  }

  return body;
}
