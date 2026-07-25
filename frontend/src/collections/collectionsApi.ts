import { AccessTokenProvider, apiDelete, apiGet, apiPost, apiPut } from "../shared/api/apiClient";

export type Collection = {
  id: string;
  name: string;
  ownerId: string;
  owner?: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type CollectionShare = {
  id: string;
  collectionId: string;
  ownerId: string;
  sharedWithUserId: string;
  permission: "read" | "edit";
  sharedWithUser: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type SharePermission = "read" | "edit";

export function fetchCollections(getAccessToken: AccessTokenProvider, name?: string, scope: "owned" | "shared" = "owned") {
  const params = new URLSearchParams();
  if (name) {
    params.set("name", name);
  }
  if (scope === "shared") {
    params.set("scope", "shared");
  }
  const query = params.toString() ? `?${params.toString()}` : "";
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

export function shareCollection(getAccessToken: AccessTokenProvider, id: string, email: string, permission: SharePermission) {
  return apiPost<CollectionShare>(`/collections/${id}/shares`, getAccessToken, { email, permission });
}

export function fetchCollectionShares(getAccessToken: AccessTokenProvider, id: string) {
  return apiGet<CollectionShare[]>(`/collections/${id}/shares`, getAccessToken);
}

export function revokeCollectionShare(getAccessToken: AccessTokenProvider, id: string, shareId: string) {
  return apiDelete<{ deleted: true }>(`/collections/${id}/shares/${shareId}`, getAccessToken);
}
