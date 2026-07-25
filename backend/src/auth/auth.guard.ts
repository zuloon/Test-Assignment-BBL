import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user";

export type AuthenticatedRequest = Request & {
  user?: CurrentUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await this.authService.verifyBearerToken(request.header("authorization"));
    return true;
  }
}
