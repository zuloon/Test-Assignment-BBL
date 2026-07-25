import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type BookmarkInput = {
  url?: string;
  title?: string;
  notes?: string | null;
  collectionId?: string | null;
};

@Injectable()
export class BookmarksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(ownerId: string, collectionId?: string) {
    return this.prisma.bookmark.findMany({
      where: {
        ownerId,
        ...(collectionId ? { collectionId } : {})
      },
      include: { collection: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async listForCollection(ownerId: string, collectionId: string) {
    await this.assertReadableCollection(ownerId, collectionId);
    return this.prisma.bookmark.findMany({
      where: { collectionId },
      include: { collection: true },
      orderBy: { updatedAt: "desc" }
    });
  }

  async create(ownerId: string, input: BookmarkInput) {
    const collectionId = await this.validatedCollectionId(ownerId, input.collectionId);

    return this.prisma.bookmark.create({
      data: {
        url: this.required(input.url, "Bookmark not found"),
        title: this.required(input.title, "Bookmark not found"),
        notes: input.notes ?? null,
        collectionId,
        ownerId
      },
      include: { collection: true }
    });
  }

  async get(ownerId: string, id: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id, ownerId },
      include: { collection: true }
    });

    if (!bookmark) {
      throw new NotFoundException("Bookmark not found");
    }

    return bookmark;
  }

  async replace(ownerId: string, id: string, input: BookmarkInput) {
    await this.get(ownerId, id);
    const collectionId = await this.validatedCollectionId(ownerId, input.collectionId);

    return this.prisma.bookmark.update({
      where: { id },
      data: {
        url: this.required(input.url, "Bookmark not found"),
        title: this.required(input.title, "Bookmark not found"),
        notes: input.notes ?? null,
        collectionId
      },
      include: { collection: true }
    });
  }

  async update(ownerId: string, id: string, input: BookmarkInput) {
    await this.get(ownerId, id);
    const hasCollectionId = Object.prototype.hasOwnProperty.call(input, "collectionId");
    const collectionId = hasCollectionId ? await this.validatedCollectionId(ownerId, input.collectionId) : undefined;

    return this.prisma.bookmark.update({
      where: { id },
      data: {
        ...(input.url !== undefined ? { url: this.required(input.url, "Bookmark not found") } : {}),
        ...(input.title !== undefined ? { title: this.required(input.title, "Bookmark not found") } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(hasCollectionId ? { collectionId } : {})
      },
      include: { collection: true }
    });
  }

  async delete(ownerId: string, id: string) {
    await this.get(ownerId, id);
    await this.prisma.bookmark.delete({ where: { id } });
    return { deleted: true };
  }

  private async validatedCollectionId(ownerId: string, collectionId: string | null | undefined) {
    if (!collectionId) {
      return null;
    }

    await this.assertOwnedCollection(ownerId, collectionId);
    return collectionId;
  }

  private async assertOwnedCollection(ownerId: string, collectionId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, ownerId },
      select: { id: true }
    });

    if (!collection) {
      throw new NotFoundException("Collection not found");
    }
  }

  private async assertReadableCollection(userId: string, collectionId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        id: collectionId,
        OR: [
          { ownerId: userId },
          {
            shares: {
              some: {
                sharedWithUserId: userId,
                permission: "read"
              }
            }
          }
        ]
      },
      select: { id: true }
    });

    if (!collection) {
      throw new NotFoundException("Collection not found");
    }
  }

  private required(value: string | undefined, message: string) {
    const trimmed = value?.trim();

    if (!trimmed) {
      throw new NotFoundException(message);
    }

    return trimmed;
  }
}
