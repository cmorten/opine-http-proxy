import { describe, it } from "./support/utils.ts";
import { expect, opine, superdeno } from "./deps.ts";
import { proxy } from "../mod.ts";

describe("when userResHeaderDecorator is defined", () => {
  it("provides an interface for updating headers", (done) => {
    const target = opine();
    target.use((req, res) => {
      res.json(req.headers);
    });
    const targetServer = target.listen();
    const targetPort = (targetServer.addrs[0] as Deno.NetAddr).port;

    const app = opine();
    app.use(proxy(`http://localhost:${targetPort}`, {
      srcResHeaderDecorator: (headers) => {
        headers.set("x-proxy", "opine-http-proxy");

        return headers;
      },
    }));

    superdeno(app)
      .get("/proxy")
      .end((err, res) => {
        targetServer.close();
        expect(res.header["x-proxy"]).toEqual("opine-http-proxy");
        done(err);
      });
  });
});
