import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedRequest } from "./auth.guard";

export const CurrentUserParam = createParamDecorator((_: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
