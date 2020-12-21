import { describe, it } from "./support/utils.ts";
import { expect, opine, superdeno } from "./deps.ts";
import { proxy } from "../mod.ts";

describe("proxies headers", () => {
  it("should pass on headers set as options", (done) => {
    const app = opine();
    app.use(proxy("http://httpbin.org", {
      headers: {
        "X-Deno": "opine-http-proxy",
      },
    }));

    superdeno(app)
      .get("/headers")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.headers["X-Deno"] === "opine-http-proxy");
        done();
      });
  });

  it("should pass on headers set on the request", (done) => {
    const app = opine();
    app.use(proxy("http://httpbin.org", {
      headers: {
        "X-Deno": "opine-http-proxy",
      },
    }));

    superdeno(app)
      .get("/headers")
      .set("X-Powered-By", "Deno")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.headers["X-Powered-By"]).toEqual("Deno");
        done();
      });
  });
});
