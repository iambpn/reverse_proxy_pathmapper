# reverse_proxy_pathmapper

Reverse proxy URL path mapper using http-proxy.

## Installing using NPM

`npm i reverse_proxy_pathmapper`

## Usecase

This can be used as the dev replacement for nginx/ingress controller when working with multiple web servers.

## Usage

```TS
import {ReverseProxyPathMapper} from "reverse_proxy_path_mapper";
new ReverseProxyPathMapper({}, pathMapper).serve(9000);
```

## Example PathMapper object

- Key of path mapper object takes the string type which can include the regex string. Key must start with leading `/`
- Value of path mapper object takes the string or object
  - If string then it must be a URL to the destination server.
  - If object then it should have two property `URL` (Destination Server URL) and `rewriteURL` (Either to append Destination URL with the incoming url or not);

```TS
const pathMapper = {
  '/8080/?(.*)': 'http://localhost:8080', // value must not end with trailing slash
  '/8081/?(.*)': {
    URL: 'http://localhost:8081',
    rewriteURL: false
    // since rewriteURL is false proxy will append '/8081/<regex url>' to http://localhost:8081 -> Final URL: 'http://localhost:8081/8081/<regex url>'
  },
  '/8081/static': {
    URL: 'http://localhost:8081',
    rewriteURL: true
    // since rewriteURL is true proxy will not append '/8081/static' to http://localhost:8081 -> Final URL: http://localhost:8081
  }
}
```
