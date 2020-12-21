import { describe, it } from "./support/utils.ts";
import { proxyTarget } from "./support/proxyTarget.ts";
import { opine, superdeno } from "./deps.ts";
import { proxy } from "../mod.ts";

const proxyRouteFn = [
  {
    method: "get",
    path: "/",
    fn: (req: any, res: any) => {
      res.send("Hello Deno");
    },
  },
];

describe("url parsing", () => {
  it("can parse a local url with a port", (done) => {
    const target = proxyTarget({ handlers: proxyRouteFn });
    const targetPort = (target.listener.addr as Deno.NetAddr).port;

    const app = opine();
    app.use(proxy(`http://localhost:${targetPort}`));

    superdeno(app)
      .get("/")
      .end((err) => {
        target.close();
        done(err);
      });
  });

  it("can parse a url with a port", (done) => {
    const app = opine();
    app.use(proxy("http://httpbin.org:80"));

    superdeno(app)
      .get("/")
      .end(done);
  });

  it("does not throw `Uncaught RangeError` if you have both a port and a trailing slash", (
    done,
  ) => {
    const app = opine();
    app.use(proxy("http://httpbin.org:80/"));

    superdeno(app)
      .get("/")
      .end(done);
  });
});
