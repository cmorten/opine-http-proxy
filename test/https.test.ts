import { describe, it } from "./support/utils.ts";
import { superdeno, opine, expect } from "./deps.ts";
import { proxy } from "../mod.ts";

describe("proxies https", () => {
  function assertSecureRequest(app: any, done: any) {
    superdeno(app)
      .get("/get?show_env=1")
      .end((err, res) => {
        expect(res.body.headers["X-Forwarded-Port"]).toEqual("443");
        expect(res.body.headers["X-Forwarded-Proto"]).toEqual("https");
        done(err);
      });
  }

  it("should proxy via https for a string url with 'https' protocol", (
    done,
  ) => {
    const app = opine();
    app.use(proxy("https://httpbin.org"));
    assertSecureRequest(app, done);
  });

  it("should proxy via https for a string url with 'http' protocol but 'secure' option set to true", (
    done,
  ) => {
    const app = opine();
    app.use(proxy("http://httpbin.org", { secure: true }));
    assertSecureRequest(app, done);
  });

  it("should proxy via https for a function url with 'https' protocol", (
    done,
  ) => {
    const app = opine();
    app.use(proxy(() => {
      return "https://httpbin.org";
    }));
    assertSecureRequest(app, done);
  });

  it("should proxy via https for a function url with 'http' protocol but 'secure' option set to true", (
    done,
  ) => {
    const app = opine();
    app.use(proxy(() => {
      return "http://httpbin.org";
    }, { secure: true }));
    assertSecureRequest(app, done);
  });
});
