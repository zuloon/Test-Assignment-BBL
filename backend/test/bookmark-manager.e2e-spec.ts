import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { existsSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";

const userA = "auth0|user-a";
const userB = "auth0|user-b";
const testDbUrl = "file:./test.e2e.db";

function auth(userId: string) {
  return `Bearer test:${userId}`;
}

async function resetDatabase() {
  const { DatabaseSync } = (await import("node:sqlite")) as any;
  const dbPath = resolve(dirname(fileURLToPath(import.meta.url)), "../prisma/test.e2e.db");
  const db = new DatabaseSync(dbPath);

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

    DELETE FROM "CollectionShare";
    DELETE FROM "Bookmark";
    DELETE FROM "Collection";
    DELETE FROM "User";

    INSERT INTO "User" ("id", "email", "name")
    VALUES ('auth0|user-a', 'candidate@test.com', 'Candidate User');

    INSERT INTO "User" ("id", "email", "name")
    VALUES ('auth0|user-b', 'other-user@test.com', 'Other User');
  `);

  db.close();
}

describe("bookmark manager API", () => {
  let app: INestApplication;
  const previousAuthMode = process.env.AUTH_MODE;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  beforeAll(async () => {
    process.env.AUTH_MODE = "test";
    process.env.DATABASE_URL = testDbUrl;

    const dbPath = resolve(dirname(fileURLToPath(import.meta.url)), "../prisma/test.e2e.db");
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }

    await resetDatabase();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();

    if (previousAuthMode === undefined) {
      delete process.env.AUTH_MODE;
    } else {
      process.env.AUTH_MODE = previousAuthMode;
    }

    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
  });

  it("rejects protected routes without a bearer token", async () => {
    await request(app.getHttpServer()).get("/collections").expect(401);
  });

  it("keeps collections private across owners", async () => {
    const created = await request(app.getHttpServer())
      .post("/collections")
      .set("Authorization", auth(userA))
      .send({ name: "Private reads" })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/collections/${created.body.id}`)
      .set("Authorization", auth(userB))
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/collections/${created.body.id}`)
      .set("Authorization", auth(userB))
      .send({ name: "Changed" })
      .expect(404);
  });

  it("keeps bookmarks owner-scoped and validates collection ownership", async () => {
    const collection = await request(app.getHttpServer())
      .post("/collections")
      .set("Authorization", auth(userA))
      .send({ name: "Articles" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/bookmarks")
      .set("Authorization", auth(userB))
      .send({ url: "https://example.com", title: "Example", collectionId: collection.body.id })
      .expect(404);

    const bookmark = await request(app.getHttpServer())
      .post("/bookmarks")
      .set("Authorization", auth(userA))
      .send({ url: "https://example.com", title: "Example", collectionId: collection.body.id })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get("/bookmarks")
      .set("Authorization", auth(userA))
      .expect(200);

    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(bookmark.body.id);

    await request(app.getHttpServer())
      .get(`/bookmarks/${bookmark.body.id}`)
      .set("Authorization", auth(userB))
      .expect(404);
  });

  it("searches owned bookmarks by title, url, and notes", async () => {
    await request(app.getHttpServer())
      .post("/bookmarks")
      .set("Authorization", auth(userA))
      .send({ url: "https://example.com/prisma", title: "Prisma notes", notes: "ORM reference" })
      .expect(201);

    await request(app.getHttpServer())
      .post("/bookmarks")
      .set("Authorization", auth(userA))
      .send({ url: "https://example.com/react", title: "React docs", notes: "Frontend reference" })
      .expect(201);

    const byTitle = await request(app.getHttpServer())
      .get("/bookmarks?q=prisma")
      .set("Authorization", auth(userA))
      .expect(200);

    expect(byTitle.body).toHaveLength(1);
    expect(byTitle.body[0].title).toBe("Prisma notes");

    const byNotes = await request(app.getHttpServer())
      .get("/bookmarks?q=Frontend")
      .set("Authorization", auth(userA))
      .expect(200);

    expect(byNotes.body).toHaveLength(1);
    expect(byNotes.body[0].title).toBe("React docs");
  });

  it("requires an explicit action before deleting a collection with bookmarks", async () => {
    const collection = await request(app.getHttpServer())
      .post("/collections")
      .set("Authorization", auth(userA))
      .send({ name: "To clean up" })
      .expect(201);

    const bookmark = await request(app.getHttpServer())
      .post("/bookmarks")
      .set("Authorization", auth(userA))
      .send({ url: "https://example.com", title: "Example", collectionId: collection.body.id })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/collections/${collection.body.id}`)
      .set("Authorization", auth(userA))
      .expect(409);

    await request(app.getHttpServer())
      .delete(`/collections/${collection.body.id}`)
      .set("Authorization", auth(userA))
      .send({ bookmarkAction: "uncategorize" })
      .expect(200)
      .expect({ deleted: true });

    const updatedBookmark = await request(app.getHttpServer())
      .get(`/bookmarks/${bookmark.body.id}`)
      .set("Authorization", auth(userA))
      .expect(200);

    expect(updatedBookmark.body.collectionId).toBeNull();
  });

  it("allows read-only sharing and revocation", async () => {
    const collection = await request(app.getHttpServer())
      .post("/collections")
      .set("Authorization", auth(userA))
      .send({ name: "Shared reads" })
      .expect(201);

    const bookmark = await request(app.getHttpServer())
      .post("/bookmarks")
      .set("Authorization", auth(userA))
      .send({ url: "https://example.com/shared", title: "Shared", collectionId: collection.body.id })
      .expect(201);

    const share = await request(app.getHttpServer())
      .post(`/collections/${collection.body.id}/shares`)
      .set("Authorization", auth(userA))
      .send({ email: "other-user@test.com", permission: "edit" })
      .expect(201);

    expect(share.body.permission).toBe("edit");

    const sharedCollections = await request(app.getHttpServer())
      .get("/collections?scope=shared")
      .set("Authorization", auth(userB))
      .expect(200);

    expect(sharedCollections.body.map((item: { id: string }) => item.id)).toContain(collection.body.id);

    await request(app.getHttpServer())
      .get(`/collections/${collection.body.id}`)
      .set("Authorization", auth(userB))
      .expect(200);

    const sharedBookmarks = await request(app.getHttpServer())
      .get(`/collections/${collection.body.id}/bookmarks`)
      .set("Authorization", auth(userB))
      .expect(200);

    expect(sharedBookmarks.body.map((item: { id: string }) => item.id)).toContain(bookmark.body.id);

    await request(app.getHttpServer())
      .patch(`/collections/${collection.body.id}`)
      .set("Authorization", auth(userB))
      .send({ name: "Edited by reader" })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/collections/${collection.body.id}/shares/${share.body.id}`)
      .set("Authorization", auth(userA))
      .expect(200)
      .expect({ deleted: true });

    await request(app.getHttpServer())
      .get(`/collections/${collection.body.id}`)
      .set("Authorization", auth(userB))
      .expect(404);
  });
});
