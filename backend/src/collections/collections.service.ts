import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type CollectionInput = {
  name?: string;
};

type DeleteCollectionInput = {
  bookmarkAction?: "uncategorize" | "move" | "delete";
  targetCollectionId?: string;
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

  async delete(ownerId: string, id: string, input: DeleteCollectionInput = {}) {
    await this.get(ownerId, id);

    const bookmarkCount = await this.prisma.bookmark.count({
      where: { ownerId, collectionId: id }
    });

    if (bookmarkCount > 0 && !input.bookmarkAction) {
      throw new ConflictException("Collection contains bookmarks; choose how to handle them");
    }

    if (input.bookmarkAction === "move") {
      if (!input.targetCollectionId || input.targetCollectionId === id) {
        throw new NotFoundException("Collection not found");
      }

      await this.get(ownerId, input.targetCollectionId);
      await this.prisma.bookmark.updateMany({
        where: { ownerId, collectionId: id },
        data: { collectionId: input.targetCollectionId }
      });
    }

    if (input.bookmarkAction === "uncategorize") {
      await this.prisma.bookmark.updateMany({
        where: { ownerId, collectionId: id },
        data: { collectionId: null }
      });
    }

    if (input.bookmarkAction === "delete") {
      await this.prisma.bookmark.deleteMany({
        where: { ownerId, collectionId: id }
      });
    }

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
