import { Module } from "@nestjs/common";
import { CollectionsModule } from "./collections/collections.module";
import { HealthModule } from "./health/health.module";
import { MeModule } from "./me/me.module";

@Module({
  imports: [HealthModule, MeModule, CollectionsModule]
})
export class AppModule {}
