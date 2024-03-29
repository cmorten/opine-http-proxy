# ChangeLog

For the latest changes, please refer to the
[releases page](https://github.com/cmorten/opine-http-proxy/releases).

## [3.0.2] - 27-08-2022

- feat: update to Deno `1.25.0`, std `0.153.0`
- feat: upgrade Opine to `2.3.1`

## [3.0.1] - 10-01-2022

- [#12] `method` should have type `string` not `"string"`
- feat: update to Deno `1.17.2`, std `0.120.0`
- feat: upgrade Opine to `2.0.2` in tests
- feat: other minor dependency upgrades
- chore: changes to reflect GitHub repo transfer

## [3.0.0] - 21-11-2021

- [#10] Store and pass the proxy response data as an `Uint8Array` instead of
  always decoding to a string (#11)

This impacts:

- [`srcResDecorator`](https://github.com/cmorten/opine-http-proxy/tree/main#srcresdecoratorreq-res-proxyres-proxyresdata-supports-promise)
- [`filterRes`](https://github.com/cmorten/opine-http-proxy/tree/main#filterresproxyres-proxyresdata-supports-promise-form)

Where the `proxyResData` argument will be of type `Uint8Array|null` and not
`string|null`. If you require the value to be a string, you will need to decode
it yourself using, e.g.

```ts
new TextDecoder().decode(proxyResData);
```

## [2.9.2] - 21-11-2021

- feat: update to Deno `1.16.2`, std `0.115.1`

## [2.9.1] - 14-11-2021

- feat: update to Deno `1.16.1`, std `0.114.0`
- feat: upgrade Opine dependency to `1.9.1`

## [2.9.0] - 08-08-2021

- feat: update to Deno `1.12.2`, std `0.103.0`
- feat: upgrade Opine dependency to `1.7.1`

## [2.8.0] - 13-07-2021

- feat: update to Deno `1.12.0`, std `0.101.0`
- feat: upgrade Opine dependency to `1.6.0`

## [2.7.0] - 03-07-2021

- feat: update to Deno `1.11.5`, std `0.100.0`
- feat: upgrade Opine dependency to `1.5.4`
- ci: enable linting

## [2.6.0] - 26-04-2021

- feat: update to Deno `1.9.2`, std `0.95.0`
- feat: upgrade Opine dependency to `1.3.3`
- fix: remove `body` from proxied `GET` and `HEAD` requests

## [2.5.0] - 10-12-2021

- feat: support Deno `1.7.2`

## [2.4.0] - 21-12-2020

- feat: update to Deno `1.6.1`, std `0.81.0` and other dep upgrades

## [2.3.1] - 19-09-2020

- chore: upgrade to eggs@0.2.2 in CI

## [2.3.0] - 19-09-2020

- feat: update to Deno `1.4.1`, std `0.70.0` and other dep upgrades.

## [2.2.0] - 26-08-2020

- feat: update to Deno `1.3.1`, std `0.66.0` and other dep upgrades.
- test: added Windows and MacOS to workflow tests.
- fix: correctly handle null response bodies.

## [2.1.0] - 05-08-2020

- feat: upgrade Deno, std and other dep versions.
- chore: add typedoc automation
- docs: remove reference to importing commit or branch from readme as not
  supported by Deno registry v2.

## [2.0.0] - 16-07-2020

- feat: update to Deno `1.2.0` (breaking upgrade), std `0.61.0` and other dep
  upgrades.
- chore: update formatting.
- chore: add <https://nest.land> registry support and automation.

## [1.1.0] - 29-06-2020

- feat: bump Deno and std versions.
- fix: loosen types so not tied to single Opine version.

## [1.0.0] - 10-06-2020

- feat: initial loose port of
  [express-http-proxy](https://github.com/villadora/express-http-proxy).
