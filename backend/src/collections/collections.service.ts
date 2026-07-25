import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type CollectionInput = {
  name?: string;
};

@Injectable()
export class CollectionsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(ownerId: string, name?: string) {
    return this.prisma.collection.findMany({
      where: {
        ownerId,
        ...(name ? { name: { contains: name } } : {})
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  async create(ownerId: string, input: CollectionInput) {
    return this.prisma.collection.create({
      data: {
        name: this.requiredName(input.name),
        ownerId
      }
    });
  }

  async get(ownerId: string, id: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id, ownerId }
    });

    if (!collection) {
      throw new NotFoundException("Collection not found");
    }

    return collection;
  }

  async replace(ownerId: string, id: string, input: CollectionInput) {
    await this.get(ownerId, id);

    return this.prisma.collection.update({
      where: { id },
      data: {
        name: this.requiredName(input.name)
      }
    });
  }

  async update(ownerId: string, id: string, input: CollectionInput) {
    await this.get(ownerId, id);

    return this.prisma.collection.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: this.requiredName(input.name) } : {})
      }
    });
  }

  async delete(ownerId: string, id: string) {
    await this.get(ownerId, id);
    await this.prisma.collection.delete({ where: { id } });
    return { deleted: true };
  }

  private requiredName(name: string | undefined) {
    const trimmed = name?.trim();

    if (!trimmed) {
      throw new NotFoundException("Collection not found");
    }

    return trimmed;
  }
}
