import httpProxy from "http-proxy";
import http, { IncomingMessage as Request, ServerResponse as Response } from "http";

export type PathMapperType = Record<string, string | { URL: string; rewriteURL?: boolean }>;
export type PathRegex = {
  regex: RegExp;
  target: string | { URL: string; rewriteURL?: boolean };
};

export class ReverseProxyPathMapper {
  private proxy: httpProxy<Request, Response>;
  private path_regex: PathRegex[] = [];

  constructor(proxyOptions: httpProxy.ServerOptions, pathMapper: PathMapperType) {
    this.proxy = httpProxy.createProxy<Request, Response>(proxyOptions);
    this.initProxyErrorHandler();
    this.initPathRegex(pathMapper);
  }

  private initProxyErrorHandler() {
    this.proxy.on("error", function (error, req, res) {
      console.log("Proxy Error:", error);
      return res.end("Error while connecting to proxy \n\n" + error.toString());
    });
  }

  private initPathRegex(pathMapper: PathMapperType) {
    const regexKeys = Object.keys(pathMapper);
    for (let key of regexKeys) {
      this.path_regex.push({ regex: new RegExp(key), target: pathMapper[key] });
    }
  }

  private matchURL(req: Request): string | undefined {
    for (const regex of this.path_regex) {
      if (req.url && regex.regex.test(req.url)) {
        if (typeof regex.target === "string") {
          return regex.target;
        }

        if (regex.target.rewriteURL) {
          req.url = "";
          return regex.target.URL;
        }

        return undefined;
      }
    }
  }

  serve(port: number) {
    http
      .createServer((req, res) => {
        const target = this.matchURL(req);

        if (target) {
          // proxy request
          return this.proxy.web(req, res, { target: target });
        }

        // Send res.end() with some message
        const errorMsg = `Path: ${req.url}  Did not matched.`;
        console.log(errorMsg);
        return res.end(errorMsg);
      })
      .listen(port, () => {
        console.log("Reverse Proxy listening on port " + port);
      });
  }
}
