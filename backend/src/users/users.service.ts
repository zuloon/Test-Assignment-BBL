import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser } from "../auth/current-user";

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findOrCreateFromAuth(user: CurrentUser) {
    return this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name
      },
      create: {
        id: user.id,
        email: user.email ?? `${user.id}@users.local`,
        name: user.name
      }
    });
  }
}
