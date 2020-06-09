import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { superdeno, opine } from "./deps.ts";
import { Request, Response, NextFunction } from "../deps.ts";
import { proxy } from "../mod.ts";

const proxyRouteFn = [{
  method: "get",
  path: "/",
  fn: (req: Request, res: Response) => {
    return res.setStatus(200).send("Proxy Server");
  },
}];

function nextMethod(req: Request, res: Response, next: NextFunction) {
  res.setStatus(201).send("Client Application");
}

describe("filterReq", () => {
  it("should continue route processing when the filter function returns false (i.e. don't filter)", (
    done,
  ) => {
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

  it("should stop route processing when the filter function returns true (i.e. filter)", (
    done,
  ) => {
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

  it("should continue route processing when the filter function returns Promise<false> (i.e. don't filter)", (
    done,
  ) => {
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

  it("should stop route processing when the filter function returns Promise<true> (i.e. filter)", (
    done,
  ) => {
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
