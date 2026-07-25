import { DatabaseSync } from "node:sqlite";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const prismaDir = dirname(fileURLToPath(import.meta.url));
const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const databasePath = databaseUrl.startsWith("file:")
  ? databaseUrl.slice("file:".length)
  : databaseUrl;
const db = new DatabaseSync(isAbsolute(databasePath) ? databasePath : resolve(prismaDir, databasePath));

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

  CREATE TABLE IF NOT EXISTS "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Collection_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "Collection_ownerId_idx" ON "Collection"("ownerId");

  CREATE TABLE IF NOT EXISTS "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "collectionId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_collectionId_fkey"
      FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id")
      ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE INDEX IF NOT EXISTS "Bookmark_ownerId_idx" ON "Bookmark"("ownerId");
  CREATE INDEX IF NOT EXISTS "Bookmark_collectionId_idx" ON "Bookmark"("collectionId");

  CREATE TABLE IF NOT EXISTS "CollectionShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sharedWithUserId" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'read',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CollectionShare_collectionId_fkey"
      FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionShare_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CollectionShare_sharedWithUserId_fkey"
      FOREIGN KEY ("sharedWithUserId") REFERENCES "User" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "CollectionShare_collectionId_sharedWithUserId_key"
    ON "CollectionShare"("collectionId", "sharedWithUserId");
  CREATE INDEX IF NOT EXISTS "CollectionShare_ownerId_idx" ON "CollectionShare"("ownerId");
  CREATE INDEX IF NOT EXISTS "CollectionShare_sharedWithUserId_idx" ON "CollectionShare"("sharedWithUserId");

  INSERT INTO "User" ("id", "email", "name")
  VALUES ('auth0|user-a', 'candidate@test.com', 'Candidate User')
  ON CONFLICT("id") DO UPDATE SET
    "email"=excluded."email",
    "name"=excluded."name",
    "updatedAt"=CURRENT_TIMESTAMP;

  INSERT INTO "User" ("id", "email", "name")
  VALUES ('auth0|user-b', 'other-user@test.com', 'Other User')
  ON CONFLICT("id") DO UPDATE SET
    "email"=excluded."email",
    "name"=excluded."name",
    "updatedAt"=CURRENT_TIMESTAMP;
`);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log(tables.map((table) => table.name).join(", "));
db.close();
