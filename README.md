# opine-http-proxy

Proxy middleware for Deno Opine HTTP servers.

[![GitHub tag](https://img.shields.io/github/tag/asos-craigmorten/opine-http-proxy)](https://github.com/asos-craigmorten/opine-http-proxy/tags/) ![Test](https://github.com/asos-craigmorten/opine-http-proxy/workflows/Test/badge.svg) [![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/opineHttpProxy/mod.ts) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![GitHub issues](https://img.shields.io/github/issues/asos-craigmorten/opine-http-proxy)](https://img.shields.io/github/issues/asos-craigmorten/opine-http-proxy)
![GitHub stars](https://img.shields.io/github/stars/asos-craigmorten/opine-http-proxy) ![GitHub forks](https://img.shields.io/github/forks/asos-craigmorten/opine-http-proxy) ![opine-http-proxy License](https://img.shields.io/github/license/asos-craigmorten/opine-http-proxy) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/asos-craigmorten/opine-http-proxy/graphs/commit-activity) [![HitCount](http://hits.dwyl.com/asos-craigmorten/opine-http-proxy.svg)](http://hits.dwyl.com/asos-craigmorten/opine-http-proxy)

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@main/mod.ts";
import { opine } from "https://deno.land/x/opine@0.19.1/mod.ts";

const app = opine();

app.use(proxy("https://github.com/asos-craigmorten/opine-http-proxy"));

app.listen(3000);
```

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

You can then import opine-http-proxy straight into your project:

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@main/mod.ts";
```

If you want to use a specific version of opine-http-proxy, just modify the import url to contain the version:

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@2.0.0/mod.ts";
```

Or if you want to use a specific commit of opine-http-proxy, just modify the import url to contain the commit hash:

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@627326/mod.ts";
```

## Docs

- [opine-http-proxy Type Docs](https://asos-craigmorten.github.io/opine-http-proxy/)
- [opine-http-proxy Deno Docs](https://doc.deno.land/https/deno.land/x/opineHttpProxy/mod.ts)
- [License](https://github.com/asos-craigmorten/opine-http-proxy/blob/main/LICENSE.md)
- [Changelog](https://github.com/asos-craigmorten/opine-http-proxy/blob/main/.github/CHANGELOG.md)

## Usage

### URL

The url argument that can be a string, URL or a function that returns a string or URL. This is used as the url to proxy requests to. The remaining path from a request that has not been matched by Opine will be appended to the provided url when making the proxied request.

```ts
app.get("/string", proxy("http://google.com"));

app.get("/url", proxy(new URL("http://google.com")));

app.get("/function", proxy(() => new URL("http://google.com")));
```

### Proxy Options

You can also provide several options which allow you to filter, customize and decorate proxied requests and responses.

```ts
app.use(proxy("http://google.com", proxyOptions));
```

#### filterReq(req, res) (supports Promises)

The `filterReq` option can be used to limit what requests are proxied.

Return false to continue to execute the proxy; return true to skip the proxy for this request.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    filterReq: (req, res) => {
      return req.method === "GET";
    },
  })
);
```

Promise form:

```ts
app.use(
  proxy("localhost:12346", {
    filterReq: (req, res) => {
      return new Promise((resolve) => {
        resolve(req.method === "GET");
      });
    },
  })
);
```

Note that in the previous example, `resolve(true)` will execute the happy path for filter here (skipping the rest of the proxy, and calling `next()`). `reject()` will also skip the rest of proxy and call `next()`.

#### srcResDecorator(req, res, proxyRes, proxyResData) (supports Promise)

Decorate the inbound response object from the proxied request.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    srcResDecorator: (req, res, proxyRes, proxyResData) => {
      data = JSON.parse(proxyResData.toString("utf8"));
      data.newProperty = "exciting data";

      return JSON.stringify(data);
    },
  })
);
```

```ts
app.use(
  proxy("httpbin.org", {
    srcResDecorator: (req, res, proxyRes, proxyResData) => {
      return new Promise((resolve) => {
        proxyResData.message = "Hello Deno!";

        setTimeout(() => {
          resolve(proxyResData);
        }, 200);
      });
    },
  })
);
```

##### 304 - Not Modified

When your proxied service returns 304 Not Modified this step will be skipped, since there should be no body to decorate.

##### Exploiting references

The intent is that this be used to modify the proxy response data only.

Note: The other arguments are passed by reference, so you _can_ currently exploit this to modify either response's headers, for instance, but this is not a reliable interface.

#### memoizeUrl

Defaults to `true`.

When true, the `url` argument will be parsed on first request, and memoized for subsequent requests.

When `false`, `url` argument will be parsed on each request.

For example:

```ts
function coinToss() {
  return Math.random() > 0.5;
}

function getUrl() {
  return coinToss() ? "http://yahoo.com" : "http://google.com";
}

app.use(
  proxy(getUrl, {
    memoizeUrl: false,
  })
);
```

In this example, when `memoizeUrl: false`, the coinToss occurs on each request, and each request could get either value.

Conversely, When `memoizeUrl: true`, the coinToss would occur on the first request, and all additional requests would return the value resolved on the first request.

### srcResHeaderDecorator

Decorate the inbound response headers from the proxied request.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    srcResHeaderDecorator(headers, req, res, proxyReq, proxyRes) {
      return headers;
    },
  })
);
```

#### filterRes(proxyRes, proxyResData) (supports Promise form)

Allows you to inspect the proxy response, and decide if you want to continue processing (via opine-http-proxy) or call `next()` to return control to Opine.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    filterRes(proxyRes) {
      return proxyRes.status === 404;
    },
  })
);
```

### proxyErrorHandler

By default, `opine-http-proxy` will pass any errors except `ECONNRESET` and `ECONTIMEDOUT` to `next(err)`, so that your application can handle or react to them, or just drop through to your default error handling.

If you would like to modify this behavior, you can provide your own `proxyErrorHandler`.

```ts
// Example of skipping all error handling.

app.use(
  proxy("localhost:12346", {
    proxyErrorHandler(err, res, next) {
      next(err);
    },
  })
);

// Example of rolling your own error handler

app.use(
  proxy("localhost:12346", {
    proxyErrorHandler(err, res, next) {
      switch (err && err.code) {
        case "ECONNRESET": {
          return res.sendStatus(405);
        }
        case "ECONNREFUSED": {
          return res.sendStatus(200);
        }
        default: {
          next(err);
        }
      }
    },
  })
);
```

#### proxyReqUrlDecorator(url, req) (supports Promise form)

Decorate the outbound proxied request url.

The returned url is used for the `fetch` method internally.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    proxyReqUrlDecorator(url, req) {
      url.pathname = "/";

      return url;
    },
  })
);
```

You can also use Promises:

```ts
app.use(
  "/proxy",
  proxy("localhost:3000", {
    proxyReqOptDecorator(url, req) {
      return new Promise((resolve, reject) => {
        if (url.pathname === "/login") {
          url.port = 8080;
        }

        resolve(url);
      });
    },
  })
);
```

#### proxyReqInitDecorator(proxyReqOpts, req) (supports Promise form)

Decorate the outbound proxied request initialization options.

This configuration will be used within the `fetch` method internally to make the request to the provided url.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    proxyReqInitDecorator(proxyReqOpts, srcReq) {
      // you can update headers
      proxyReqOpts.headers.set("Content-Type", "text/html");
      // you can change the method
      proxyReqOpts.method = "GET";

      return proxyReqOpts;
    },
  })
);
```

You can also use Promises:

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      return new Promise((resolve, reject) => {
        proxyReqOpts.headers.set("Content-Type", "text/html");

        resolve(proxyReqOpts);
      });
    },
  })
);
```

#### secure

Normally, your proxy request will be made on the same protocol as the `url` parameter. If you'd like to force the proxy request to be https, use this option.

```ts
app.use(
  "/proxy",
  proxy("http://www.google.com", {
    secure: true,
  })
);
```

Note: if the proxy is passed a url without a protocol then HTTP will be used by default unless overridden by this option.

#### preserveHostHeader

You can copy the host HTTP header to the proxied Opine server using the `preserveHostHeader` option.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    preserveHostHeader: true,
  })
);
```

#### parseReqBody

The `parseReqBody` option allows you to control whether the request body should be parsed and sent with the proxied request.

#### reqAsBuffer

Configure whether the proxied request body should be sent as a UInt8Array buffer.

Ignored if `parseReqBody` is set to `false`.

```ts
app.use(
  "/proxy",
  proxy("www.google.com", {
    reqAsBuffer: true,
  })
);
```

#### reqBodyEncoding

The request body encoding to use. Currently only "utf-8" is supported.

Ignored if `parseReqBody` is set to `false`.

```ts
app.use(
  "/post",
  proxy("httpbin.org", {
    reqBodyEncoding: "utf-8",
  })
);
```

#### timeout

Configure a timeout in ms for the outbound proxied request.

If not provided the request will never time out.

Timed-out requests will respond with 504 status code and a X-Timeout-Reason header.

```ts
app.use(
  "/",
  proxy("httpbin.org", {
    timeout: 2000, // in milliseconds, two seconds
  })
);
```

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/opine-http-proxy/blob/main/.github/CONTRIBUTING.md)

---

## License

opine-http-proxy is licensed under the [MIT License](./LICENSE.md).
