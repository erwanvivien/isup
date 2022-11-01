-- CreateTable
CREATE TABLE "Service" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "interval" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceName" TEXT NOT NULL,
    "serviceKind" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commandName" TEXT NOT NULL,
    "stdout" TEXT NOT NULL,
    "retcode" INTEGER NOT NULL,
    CONSTRAINT "ServiceStatus_serviceName_serviceKind_fkey" FOREIGN KEY ("serviceName", "serviceKind") REFERENCES "Service" ("name", "kind") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecException" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "code" INTEGER,
    "killed" BOOLEAN,
    "cmd" TEXT,
    "signal" TEXT,
    "stack" TEXT
);

-- CreateIndex
CREATE INDEX "Service_name_kind_idx" ON "Service"("name", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_kind_key" ON "Service"("name", "kind");

-- CreateIndex
CREATE INDEX "ServiceStatus_serviceName_serviceKind_timestamp_idx" ON "ServiceStatus"("serviceName", "serviceKind", "timestamp");
