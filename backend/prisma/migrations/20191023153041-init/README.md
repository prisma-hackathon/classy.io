# Migration `20191023153041-init`

This migration has been generated by timsuchanek at 10/23/2019, 3:30:41 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE `classy-dev`.`ClassificationJob` (
  `id` int NOT NULL  AUTO_INCREMENT,
  `signedUrl` varchar(191) NOT NULL DEFAULT '' ,
  `zipUploaded` boolean NOT NULL DEFAULT false ,
  `zipUrl` varchar(191) NOT NULL DEFAULT '' ,
  PRIMARY KEY (`id`)
)
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `classy-dev`.`Algorithm` (
  `id` int NOT NULL  AUTO_INCREMENT,
  `link` varchar(191) NOT NULL DEFAULT '' ,
  `name` varchar(191) NOT NULL DEFAULT '' ,
  PRIMARY KEY (`id`)
)
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `classy-dev`.`ClassificationResult` (
  `accuracy` Decimal(65,30) NOT NULL DEFAULT 0 ,
  `id` int NOT NULL  AUTO_INCREMENT,
  `inferenceTime` Decimal(65,30) NOT NULL DEFAULT 0 ,
  `trainingTime` Decimal(65,30) NOT NULL DEFAULT 0 ,
  PRIMARY KEY (`id`)
)
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `classy-dev`.`ClassificationResult` ADD COLUMN `algorithm` int  ,
ADD FOREIGN KEY (`algorithm`) REFERENCES `classy-dev`.`Algorithm`(`id`) ON DELETE SET NULL,
ADD COLUMN `classificationJob` int  ,
ADD FOREIGN KEY (`classificationJob`) REFERENCES `classy-dev`.`ClassificationJob`(`id`) ON DELETE SET NULL;

CREATE UNIQUE INDEX `ClassificationJob.zipUrl` ON `classy-dev`.`ClassificationJob`(`zipUrl`)

CREATE UNIQUE INDEX `ClassificationJob.signedUrl` ON `classy-dev`.`ClassificationJob`(`signedUrl`)
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..20191023153041-init
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,32 @@
+datasource db {
+  provider = "mysql"
+  url      = env("MYSQL_URL")
+}
+
+generator photon {
+  provider  = "photonjs"
+  platforms = ["linux-glibc-libssl1.0.2", "native"]
+}
+
+
+model ClassificationJob {
+  id          Int                    @id
+  zipUrl      String                 @unique
+  signedUrl   String                 @unique
+  zipUploaded Boolean                @default(false)
+  results     ClassificationResult[]
+}
+
+model Algorithm {
+  id   Int    @id
+  name String
+  link String
+}
+
+model ClassificationResult {
+  id            Int       @id
+  algorithm     Algorithm
+  accuracy      Float
+  inferenceTime Float
+  trainingTime  Float
+}
```

## Photon Usage

You can use a specific Photon built for this migration (20191023153041-init)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/20191023153041-init'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
