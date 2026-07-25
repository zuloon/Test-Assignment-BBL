import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserParam } from "../auth/current-user.decorator";
import { CurrentUser } from "../auth/current-user";
import { CollectionsService } from "./collections.service";

@Controller("collections")
@UseGuards(AuthGuard)
export class CollectionsController {
  constructor(@Inject(CollectionsService) private readonly collectionsService: CollectionsService) {}

  @Get()
  list(@CurrentUserParam() user: CurrentUser, @Query("name") name?: string) {
    return this.collectionsService.list(user.id, name);
  }

  @Post()
  create(@CurrentUserParam() user: CurrentUser, @Body() body: { name?: string }) {
    return this.collectionsService.create(user.id, body);
  }

  @Get(":id")
  get(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.collectionsService.get(user.id, id);
  }

  @Put(":id")
  replace(@CurrentUserParam() user: CurrentUser, @Param("id") id: string, @Body() body: { name?: string }) {
    return this.collectionsService.replace(user.id, id, body);
  }

  @Patch(":id")
  update(@CurrentUserParam() user: CurrentUser, @Param("id") id: string, @Body() body: { name?: string }) {
    return this.collectionsService.update(user.id, id, body);
  }

  @Delete(":id")
  delete(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.collectionsService.delete(user.id, id);
  }
}
