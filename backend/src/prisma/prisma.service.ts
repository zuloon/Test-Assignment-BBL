import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { resolve } from "node:path";

function defaultDatabaseUrl() {
  const databasePath = resolve(__dirname, "../../prisma/dev.db").replace(/\\/g, "/");
  return `file:${databasePath}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? defaultDatabaseUrl()
        }
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
