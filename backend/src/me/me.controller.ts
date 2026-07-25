import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUserParam } from "../auth/current-user.decorator";
import { CurrentUser } from "../auth/current-user";
import { UsersService } from "../users/users.service";

@Controller("me")
@UseGuards(AuthGuard)
export class MeController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  async getMe(@CurrentUserParam() currentUser: CurrentUser) {
    return this.usersService.findOrCreateFromAuth(currentUser);
  }
}
