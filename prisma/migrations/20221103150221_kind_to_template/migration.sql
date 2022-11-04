/*
  Warnings:

  - You are about to drop the column `serviceKind` on the `ServiceStatus` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `Service` table. All the data in the column will be lost.
  - Added the required column `serviceTemplate` to the `ServiceStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceName" TEXT NOT NULL,
    "serviceTemplate" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commandName" TEXT NOT NULL,
    "stdout" TEXT NOT NULL,
    "retcode" INTEGER NOT NULL,
    CONSTRAINT "ServiceStatus_serviceName_serviceTemplate_fkey" FOREIGN KEY ("serviceName", "serviceTemplate") REFERENCES "Service" ("name", "template") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServiceStatus" ("commandName", "id", "retcode", "serviceName", "stdout", "timestamp") SELECT "commandName", "id", "retcode", "serviceName", "stdout", "timestamp" FROM "ServiceStatus";
DROP TABLE "ServiceStatus";
ALTER TABLE "new_ServiceStatus" RENAME TO "ServiceStatus";
CREATE INDEX "ServiceStatus_serviceName_serviceTemplate_timestamp_idx" ON "ServiceStatus"("serviceName", "serviceTemplate", "timestamp");
CREATE TABLE "new_Service" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "template" TEXT NOT NULL,
    "interval" REAL NOT NULL
);
INSERT INTO "new_Service" ("interval", "name") SELECT "interval", "name" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_name_template_idx" ON "Service"("name", "template");
CREATE UNIQUE INDEX "Service_name_template_key" ON "Service"("name", "template");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
