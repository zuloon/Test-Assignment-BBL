import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Box, Button, Chip, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, fetchBookmarks, fetchCollectionBookmarks } from "../bookmarks/bookmarksApi";
import { Collection, fetchCollections } from "../collections/collectionsApi";

type CollectionWithBookmarks = Collection & {
  bookmarks: Bookmark[];
  shared: boolean;
};

type LoadState =
  | { type: "loading" }
  | { type: "ready"; collections: CollectionWithBookmarks[]; uncategorized: Bookmark[] }
  | { type: "error"; message: string };

function matchesSearch(value: string | null | undefined, search: string) {
  return value?.toLowerCase().includes(search) ?? false;
}

export function AllPage() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [state, setState] = useState<LoadState>({ type: "loading" });
  const [search, setSearch] = useState("");

  async function loadData() {
    if (!isAuthenticated) {
      setState({ type: "ready", collections: [], uncategorized: [] });
      return;
    }

    setState({ type: "loading" });

    try {
      const [ownedCollections, sharedCollections, ownedBookmarks] = await Promise.all([
        fetchCollections(getAccessTokenSilently),
        fetchCollections(getAccessTokenSilently, undefined, "shared"),
        fetchBookmarks(getAccessTokenSilently)
      ]);

      const sharedBookmarkGroups = await Promise.all(
        sharedCollections.map(async (collection) => ({
          collectionId: collection.id,
          bookmarks: await fetchCollectionBookmarks(getAccessTokenSilently, collection.id)
        }))
      );

      const collections = [...ownedCollections, ...sharedCollections].map((collection) => {
        const owned = ownedCollections.some((item) => item.id === collection.id);

        return {
          ...collection,
          shared: !owned,
          bookmarks: owned
            ? ownedBookmarks.filter((bookmark) => bookmark.collectionId === collection.id)
            : sharedBookmarkGroups.find((group) => group.collectionId === collection.id)?.bookmarks ?? []
        };
      });

      setState({
        type: "ready",
        collections,
        uncategorized: ownedBookmarks.filter((bookmark) => bookmark.collectionId === null)
      });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load all bookmarks"
      });
    }
  }

  useEffect(() => {
    void loadData();
  }, [isAuthenticated]);

  const filteredState = useMemo(() => {
    if (state.type !== "ready") {
      return state;
    }

    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return state;
    }

    return {
      type: "ready" as const,
      collections: state.collections
        .map((collection) => {
          const collectionMatches = matchesSearch(collection.name, normalizedSearch);
          const bookmarks = collectionMatches
            ? collection.bookmarks
            : collection.bookmarks.filter(
                (bookmark) =>
                  matchesSearch(bookmark.title, normalizedSearch) ||
                  matchesSearch(bookmark.url, normalizedSearch) ||
                  matchesSearch(bookmark.notes, normalizedSearch)
              );

          return { ...collection, bookmarks };
        })
        .filter((collection) => matchesSearch(collection.name, normalizedSearch) || collection.bookmarks.length > 0),
      uncategorized: state.uncategorized.filter(
        (bookmark) =>
          matchesSearch(bookmark.title, normalizedSearch) ||
          matchesSearch(bookmark.url, normalizedSearch) ||
          matchesSearch(bookmark.notes, normalizedSearch)
      )
    };
  }, [search, state]);

  if (!isAuthenticated) {
    return (
      <Alert
        severity="info"
        action={
          <Button color="inherit" size="small" onClick={() => void loginWithRedirect()}>
            Log in
          </Button>
        }
      >
        Log in to view all bookmarks.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          All
        </Typography>
        <Typography color="text.secondary">Collections with their bookmarks.</Typography>
      </Box>

      <TextField
        label="Search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        size="small"
        sx={{ maxWidth: 360 }}
      />

      {filteredState.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography>Loading bookmarks</Typography>
        </Stack>
      ) : null}

      {filteredState.type === "error" ? <Alert severity="error">{filteredState.message}</Alert> : null}

      {filteredState.type === "ready" &&
      filteredState.collections.length === 0 &&
      filteredState.uncategorized.length === 0 ? (
        <Alert severity="info">No bookmarks found.</Alert>
      ) : null}

      {filteredState.type === "ready" ? (
        <Stack spacing={2}>
          {filteredState.collections.map((collection) => (
            <Stack
              key={collection.id}
              spacing={1}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                px: 2,
                py: 1.5
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6">{collection.name}</Typography>
                <Stack direction="row" spacing={1}>
                  {collection.shared ? <Chip size="small" label="Shared" /> : null}
                  <Chip size="small" label={`${collection.bookmarks.length} bookmarks`} />
                </Stack>
              </Stack>
              {collection.bookmarks.length > 0 ? (
                <Stack spacing={1}>
                  {collection.bookmarks.map((bookmark) => (
                    <Box key={bookmark.id} sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{bookmark.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bookmark.url}
                      </Typography>
                      {bookmark.notes ? (
                        <Typography variant="body2" color="text.secondary">
                          {bookmark.notes}
                        </Typography>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No bookmarks in this collection.
                </Typography>
              )}
            </Stack>
          ))}

          {filteredState.uncategorized.length > 0 ? (
            <Stack
              spacing={1}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                px: 2,
                py: 1.5
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6">Uncategorized</Typography>
                <Chip size="small" label={`${filteredState.uncategorized.length} bookmarks`} />
              </Stack>
              {filteredState.uncategorized.map((bookmark) => (
                <Box key={bookmark.id} sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{bookmark.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bookmark.url}
                  </Typography>
                  {bookmark.notes ? (
                    <Typography variant="body2" color="text.secondary">
                      {bookmark.notes}
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
