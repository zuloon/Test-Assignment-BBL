import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user";
import { CurrentUserParam } from "../auth/current-user.decorator";
import { BookmarksService } from "./bookmarks.service";

type BookmarkBody = {
  url?: string;
  title?: string;
  notes?: string | null;
  collectionId?: string | null;
};

@Controller()
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(@Inject(BookmarksService) private readonly bookmarksService: BookmarksService) {}

  @Get("bookmarks")
  list(@CurrentUserParam() user: CurrentUser, @Query("collectionId") collectionId?: string) {
    return this.bookmarksService.list(user.id, collectionId);
  }

  @Post("bookmarks")
  create(@CurrentUserParam() user: CurrentUser, @Body() body: BookmarkBody) {
    return this.bookmarksService.create(user.id, body);
  }

  @Get("bookmarks/:id")
  get(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.bookmarksService.get(user.id, id);
  }

  @Put("bookmarks/:id")
  replace(@CurrentUserParam() user: CurrentUser, @Param("id") id: string, @Body() body: BookmarkBody) {
    return this.bookmarksService.replace(user.id, id, body);
  }

  @Patch("bookmarks/:id")
  update(@CurrentUserParam() user: CurrentUser, @Param("id") id: string, @Body() body: BookmarkBody) {
    return this.bookmarksService.update(user.id, id, body);
  }

  @Delete("bookmarks/:id")
  delete(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.bookmarksService.delete(user.id, id);
  }

  @Get("collections/:id/bookmarks")
  listForCollection(@CurrentUserParam() user: CurrentUser, @Param("id") id: string) {
    return this.bookmarksService.listForCollection(user.id, id);
  }
}
