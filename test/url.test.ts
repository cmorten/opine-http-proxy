// deno-lint-ignore-file no-explicit-any
import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { expect, opine, superdeno } from "./deps.ts";
import { proxy } from "../mod.ts";

const proxyRoutes = [
  "/somePath/",
  "/somePath/longer/path",
  "/somePath/long/path/with/many/tokens",
];

const proxyKeyPath = "/somePath";

describe("url: string", () => {
  proxyRoutes.forEach((path) => {
    it(`should use the unmatched path component of "${path}" from the inbound request to proxy to the remote server (url: string)`, (done) => {
      const modifiedPath = path.replace(new RegExp(proxyKeyPath), "");

      const proxyRouteFn = {
        method: "get",
        path: modifiedPath,
        fn: (_req: any, res: any) => {
          res.json({ path, modifiedPath });
        },
      };

      const target = proxyTarget({ handlers: [proxyRouteFn] });
      const targetPort = (target.addrs[0] as Deno.NetAddr).port;

      const app = opine();
      app.use("/somePath/", proxy(`http://localhost:${targetPort}`));

      superdeno(app)
        .get(path)
        .expect(200)
        .end((err, res) => {
          expect(res.body.path).toEqual(path);
          expect(res.body.modifiedPath).toEqual(modifiedPath);
          target.close();
          done(err);
        });
    });
  });
});

describe("url: URL", () => {
  proxyRoutes.forEach((path) => {
    it(`should use the unmatched path component of "${path}" from the inbound request to proxy to the remote server (url: URL)`, (done) => {
      const modifiedPath = path.replace(new RegExp(proxyKeyPath), "");

      const proxyRouteFn = {
        method: "get",
        path: modifiedPath,
        fn: (_req: any, res: any) => {
          res.json({ path, modifiedPath });
        },
      };

      const target = proxyTarget({ handlers: [proxyRouteFn] });
      const targetPort = (target.addrs[0] as Deno.NetAddr).port;

      const app = opine();
      app.use("/somePath/", proxy(new URL(`http://localhost:${targetPort}`)));

      superdeno(app)
        .get(path)
        .expect(200)
        .end((err, res) => {
          expect(res.body.path).toEqual(path);
          expect(res.body.modifiedPath).toEqual(modifiedPath);
          target.close();
          done(err);
        });
    });
  });
});

describe("url: function", () => {
  it("should handle a dynamic url function", (done) => {
    const firstProxyApp = opine();
    const secondProxyApp = opine();

    const firstPort = 10031;
    const secondPort = 10032;

    firstProxyApp.use("/", (_req, res) => res.sendStatus(204));
    secondProxyApp.use("/", (_req, res) => res.sendStatus(200));

    const firstServer = firstProxyApp.listen(firstPort);
    const secondServer = secondProxyApp.listen(secondPort);

    const app = opine();

    app.use(
      "/proxy/:port",
      proxy((req) => `localhost:${req.params.port}`, { memoizeUrl: false }),
    );

    superdeno(app)
      .get(`/proxy/${firstPort}`)
      .expect(204)
      .end((err) => {
        firstServer.close();
        if (err) return done(err);

        superdeno(app)
          .get(`/proxy/${secondPort}`)
          .expect(200, (err) => {
            secondServer.close();
            done(err);
          });
      });
  });
});
