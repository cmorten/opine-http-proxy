// deno-lint-ignore-file no-explicit-any
import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { opine, superdeno } from "./deps.ts";
import { proxy } from "../mod.ts";

const proxyRouteFn = [{
  method: "get",
  path: "/",
  fn: (_req: any, res: any) => {
    return res.setStatus(200).send("Proxy Server");
  },
}];

function nextMethod(_req: any, res: any, _next: any) {
  res.setStatus(201).send("Client Application");
}

describe("filterReq", () => {
  it("should continue route processing when the filter function returns false (i.e. don't filter)", (done) => {
    const app = opine();
    const proxyServer = proxyTarget({ handlers: proxyRouteFn });
    const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

    app.use(proxy(`localhost:${proxyPort}`, {
      filterReq: () => false,
    }));

    app.use(nextMethod);

    superdeno(app)
      .get("/")
      .expect(200)
      .end((err) => {
        proxyServer.close();
        done(err);
      });
  });

  it("should stop route processing when the filter function returns true (i.e. filter)", (done) => {
    const app = opine();
    const proxyServer = proxyTarget({ handlers: proxyRouteFn });
    const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

    app.use(proxy(`localhost:${proxyPort}`, {
      filterReq: () => true,
    }));

    app.use(nextMethod);

    superdeno(app)
      .get("/")
      .expect(201)
      .end((err) => {
        proxyServer.close();
        done(err);
      });
  });

  it("should continue route processing when the filter function returns Promise<false> (i.e. don't filter)", (done) => {
    const app = opine();
    const proxyServer = proxyTarget({ handlers: proxyRouteFn });
    const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

    app.use(proxy(`localhost:${proxyPort}`, {
      filterReq: () => Promise.resolve(false),
    }));

    app.use(nextMethod);

    superdeno(app)
      .get("/")
      .expect(200)
      .end((err) => {
        proxyServer.close();
        done(err);
      });
  });

  it("should stop route processing when the filter function returns Promise<true> (i.e. filter)", (done) => {
    const app = opine();
    const proxyServer = proxyTarget({ handlers: proxyRouteFn });
    const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

    app.use(proxy(`localhost:${proxyPort}`, {
      filterReq: () => Promise.resolve(true),
    }));

    app.use(nextMethod);

    superdeno(app)
      .get("/")
      .expect(201)
      .end((err) => {
        proxyServer.close();
        done(err);
      });
  });
});
