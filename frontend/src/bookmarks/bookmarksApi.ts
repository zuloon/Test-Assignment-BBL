import { AccessTokenProvider, apiDelete, apiGet, apiPost, apiPut } from "../shared/api/apiClient";
import { Collection } from "../collections/collectionsApi";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  notes: string | null;
  collectionId: string | null;
  collection?: Collection | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type BookmarkInput = {
  url: string;
  title: string;
  notes?: string | null;
  collectionId?: string | null;
};

export function fetchBookmarks(getAccessToken: AccessTokenProvider, collectionId?: string) {
  const query = collectionId ? `?collectionId=${encodeURIComponent(collectionId)}` : "";
  return apiGet<Bookmark[]>(`/bookmarks${query}`, getAccessToken);
}

export function createBookmark(getAccessToken: AccessTokenProvider, input: BookmarkInput) {
  return apiPost<Bookmark>("/bookmarks", getAccessToken, input);
}

export function updateBookmark(getAccessToken: AccessTokenProvider, id: string, input: BookmarkInput) {
  return apiPut<Bookmark>(`/bookmarks/${id}`, getAccessToken, input);
}

export function deleteBookmark(getAccessToken: AccessTokenProvider, id: string) {
  return apiDelete<{ deleted: true }>(`/bookmarks/${id}`, getAccessToken);
}
