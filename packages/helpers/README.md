# Hifi Helpers

Helper functions shared across Hifi packages. This is a private package, meaning that it can only be used by another
package in this monorepo.

## Install

List this package as a dev dependency:

```json
"devDependencies": {
  "@hifi/helpers": "workspace:*",
}
```

## Usage

```ts
import { getEnvVar, getNow } from "@hifi/helpers";
```
