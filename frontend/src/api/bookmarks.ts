import { AccessTokenProvider, apiDelete, apiGet, apiPost, apiPut } from "./apiClient";
import { Collection } from "./collections";

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

export function fetchBookmarks(getAccessToken: AccessTokenProvider, collectionId?: string, q?: string) {
  const params = new URLSearchParams();
  if (collectionId) {
    params.set("collectionId", collectionId);
  }
  if (q?.trim()) {
    params.set("q", q.trim());
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Bookmark[]>(`/bookmarks${query}`, getAccessToken);
}

export function fetchCollectionBookmarks(getAccessToken: AccessTokenProvider, collectionId: string) {
  return apiGet<Bookmark[]>(`/collections/${collectionId}/bookmarks`, getAccessToken);
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
