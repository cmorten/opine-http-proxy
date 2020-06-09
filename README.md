# opine-http-proxy

Proxy middleware for Deno Opine HTTP servers.

[![GitHub tag](https://img.shields.io/github/tag/asos-craigmorten/opine-http-proxy)](https://github.com/asos-craigmorten/opine-http-proxy/tags/) ![Test](https://github.com/asos-craigmorten/opine-http-proxy/workflows/Test/badge.svg) [![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/httpProxy/mod.ts) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![GitHub issues](https://img.shields.io/github/issues/asos-craigmorten/opine-http-proxy)](https://img.shields.io/github/issues/asos-craigmorten/opine-http-proxy)
![GitHub stars](https://img.shields.io/github/stars/asos-craigmorten/opine-http-proxy) ![GitHub forks](https://img.shields.io/github/forks/asos-craigmorten/opine-http-proxy) ![opine-http-proxy License](https://img.shields.io/github/license/asos-craigmorten/opine-http-proxy) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/asos-craigmorten/opine-http-proxy/graphs/commit-activity) [![HitCount](http://hits.dwyl.com/asos-craigmorten/opine-http-proxy.svg)](http://hits.dwyl.com/asos-craigmorten/opine-http-proxy)

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@master/mod.ts";
import { opine } from "https://deno.land/x/opine@0.8.0/mod.ts";

const app = opine();

app.use(proxy("https://github.com/asos-craigmorten/opine-http-proxy"));

app.listen(3000);
```

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

You can then import opine-http-proxy straight into your project:

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@master/mod.ts";
```

If you want to use a specific version of opine-http-proxy, just modify the import url to contain the version:

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@0.3.0/mod.ts";
```

Or if you want to use a specific commit of opine-http-proxy, just modify the import url to contain the commit hash:

```ts
import { proxy } from "https://deno.land/x/opineHttpProxy@c21f8d6/mod.ts";
```

## Docs

- [opine-http-proxy Type Docs](https://asos-craigmorten.github.io/opine-http-proxy/)
- [opine-http-proxy Deno Docs](https://doc.deno.land/https/deno.land/x/opineHttpProxy/mod.ts)
- [License](https://github.com/asos-craigmorten/opine-http-proxy/blob/master/LICENSE.md)
- [Changelog](https://github.com/asos-craigmorten/opine-http-proxy/blob/master/.github/CHANGELOG.md)

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/opine-http-proxy/blob/master/.github/CONTRIBUTING.md)

---

## License

opine-http-proxy is licensed under the [MIT License](./LICENSE.md).
