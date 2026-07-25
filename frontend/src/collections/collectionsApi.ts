import { AccessTokenProvider, apiDelete, apiGet, apiPost, apiPut } from "../shared/api/apiClient";

export type Collection = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export function fetchCollections(getAccessToken: AccessTokenProvider, name?: string) {
  const query = name ? `?name=${encodeURIComponent(name)}` : "";
  return apiGet<Collection[]>(`/collections${query}`, getAccessToken);
}

export function createCollection(getAccessToken: AccessTokenProvider, name: string) {
  return apiPost<Collection>("/collections", getAccessToken, { name });
}

export function updateCollection(getAccessToken: AccessTokenProvider, id: string, name: string) {
  return apiPut<Collection>(`/collections/${id}`, getAccessToken, { name });
}

export type DeleteCollectionAction =
  | { bookmarkAction?: undefined }
  | { bookmarkAction: "uncategorize" }
  | { bookmarkAction: "delete" }
  | { bookmarkAction: "move"; targetCollectionId: string };

export function deleteCollection(getAccessToken: AccessTokenProvider, id: string, action?: DeleteCollectionAction) {
  return apiDelete<{ deleted: true }>(`/collections/${id}`, getAccessToken, action);
}
