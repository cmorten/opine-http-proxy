import { describe, it } from "./support/utils.ts";
import { expect, json, opine, superdeno, urlencoded } from "./deps.ts";
import { proxy } from "../mod.ts";

describe("when making a proxy request with a payload", () => {
  const testCases = [
    { name: "form encoded", encoding: "application/x-www-form-urlencoded" },
    { name: "JSON encoded", encoding: "application/json" },
  ];

  testCases.forEach((test) => {
    it(`should deliver non-empty querystring params when ${test.name} (GET)`, (
      done,
    ) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.get("/", (req, res) => {
        expect(req.query.name).toEqual("Deno");
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use("/proxy", proxy(`http://127.0.0.1:${proxyPort}`));

      superdeno(app)
        .get("/proxy")
        .query({ name: "Deno" })
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });

    it(`should deliver an empty body when ${test.name} (POST)`, (done) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.post("/", async (req, res) => {
        expect(req.body).toEqual({});
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use("/proxy", proxy(`http://127.0.0.1:${proxyPort}`));

      superdeno(app)
        .post("/proxy")
        .send(test.encoding.includes("json") ? {} : "")
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });

    it(`should deliver a non-empty body when ${test.name} (POST)`, (done) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.post("/", (req, res) => {
        expect(req.parsedBody.name).toEqual("Deno");
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use("/proxy", proxy(`http://127.0.0.1:${proxyPort}`));

      superdeno(app)
        .post("/proxy")
        .send(test.encoding.includes("json") ? { name: "Deno" } : "name=Deno")
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });

    it(`should not deliver a non-empty body when "parseReqBody" is for when ${test.name} (POST)`, (
      done,
    ) => {
      const target = opine();
      target.use(json());
      target.use(urlencoded());

      target.post("/", (req, res) => {
        expect(req.parsedBody).toEqual({});
        expect(req.headers.get("content-type")).toEqual(test.encoding);
        res.json({ message: "Hello Deno!" });
      });

      const proxyServer = target.listen();
      const proxyPort = (proxyServer.listener.addr as Deno.NetAddr).port;

      const app = opine();
      app.use(
        "/proxy",
        proxy(`http://127.0.0.1:${proxyPort}`, { parseReqBody: false }),
      );

      superdeno(app)
        .post("/proxy")
        .send(test.encoding.includes("json") ? { name: "Deno" } : "name=Deno")
        .set("Content-Type", test.encoding)
        .end((err, res) => {
          proxyServer.close();
          expect(res.body.message).toEqual("Hello Deno!");
          done(err);
        });
    });
  });
});
