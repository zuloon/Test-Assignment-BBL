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
  list(
    @CurrentUserParam() user: CurrentUser,
    @Query("name") name?: string,
    @Query("scope") scope?: "owned" | "shared"
  ) {
    return this.collectionsService.list(user.id, name, scope === "shared" ? "shared" : "owned");
  }

  @Post()
  create(@CurrentUserParam() user: CurrentUser, @Body() body: { name?: string }) {
    return this.collectionsService.create(user.id, body);
  }

  @Get(":id")
  get(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.collectionsService.getReadable(user.id, id);
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
  delete(
    @CurrentUserParam() user: CurrentUser,
    @Param("id") id: string,
    @Body() body: { bookmarkAction?: "uncategorize" | "move" | "delete"; targetCollectionId?: string }
  ) {
    return this.collectionsService.delete(user.id, id, body);
  }

  @Post(":id/shares")
  share(@CurrentUserParam() user: CurrentUser, @Param("id") id: string, @Body() body: { email?: string }) {
    return this.collectionsService.share(user.id, id, body);
  }

  @Get(":id/shares")
  listShares(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.collectionsService.listShares(user.id, id);
  }

  @Delete(":id/shares/:shareId")
  revokeShare(@CurrentUserParam() user: CurrentUser, @Param("id") id: string, @Param("shareId") shareId: string) {
    return this.collectionsService.revokeShare(user.id, id, shareId);
  }
}
