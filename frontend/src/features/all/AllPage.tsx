import { useAuth0 } from "@auth0/auth0-react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Bookmark as BookmarkIcon, Check, Copy, ExternalLink, Folder, Layers, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, fetchBookmarks, fetchCollectionBookmarks } from "../../api/bookmarks";
import { Collection, fetchCollections } from "../../api/collections";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  function copyToClipboard(bookmark: Bookmark) {
    void navigator.clipboard.writeText(bookmark.url);
    setCopiedId(bookmark.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getDomain(urlStr: string) {
    try {
      const parsed = new URL(urlStr.startsWith("http") ? urlStr : `https://${urlStr}`);
      return parsed.hostname;
    } catch {
      return urlStr;
    }
  }

  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#eff6ff", color: "#2563eb" }}>
            <Layers size={32} />
          </Box>
          <Typography variant="h5">Sign in to View All Vault Items</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
            Log in with Auth0 to explore all private and shared collections in your vault.
          </Typography>
          <Button variant="contained" onClick={() => void loginWithRedirect()} sx={{ px: 4 }}>
            Log in with Auth0
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          All Vault
        </Typography>
        <Typography color="text.secondary">
          Overview of all collections and uncategorized bookmarks in one place.
        </Typography>
      </Box>

      {/* Toolbar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <TextField
          placeholder="Search all titles, URLs or notes..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ minWidth: { sm: 360 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#64748b" />
                </InputAdornment>
              )
            }
          }}
        />
      </Stack>

      {filteredState.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 4, justifyContent: "center" }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Loading all bookmarks...</Typography>
        </Stack>
      ) : null}

      {filteredState.type === "error" ? <Alert severity="error">{filteredState.message}</Alert> : null}

      {filteredState.type === "ready" &&
      filteredState.collections.length === 0 &&
      filteredState.uncategorized.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", bgcolor: "#ffffff", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#f1f5f9", color: "#94a3b8" }}>
              <Layers size={32} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              No bookmarks in your vault
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search ? "No matching bookmarks found." : "Add bookmarks or collections to see them listed here."}
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      {filteredState.type === "ready" ? (
        <Stack spacing={3}>
          {filteredState.collections.map((collection) => (
            <Card key={collection.id}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          bgcolor: collection.shared ? "#e0e7ff" : "#f5f3ff",
                          color: collection.shared ? "#4338ca" : "#7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Folder size={20} />
                      </Box>
                      <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {collection.name}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      {collection.shared ? (
                        <Chip icon={<Users size={12} />} size="small" label="Shared" sx={{ bgcolor: "#e0e7ff", color: "#4338ca", fontWeight: 600 }} />
                      ) : null}
                      <Chip size="small" label={`${collection.bookmarks.length} Bookmarks`} variant="outlined" sx={{ fontWeight: 600 }} />
                    </Stack>
                  </Stack>

                  {collection.bookmarks.length > 0 ? (
                    <Stack spacing={1.5} sx={{ pt: 1 }}>
                      {collection.bookmarks.map((bookmark) => {
                        const domain = getDomain(bookmark.url);
                        const isCopied = copiedId === bookmark.id;

                        return (
                          <Paper
                            key={bookmark.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              borderColor: "#e2e8f0",
                              bgcolor: "#f8fafc",
                              transition: "all 0.15s ease",
                              "&:hover": { bgcolor: "#ffffff", borderColor: "#cbd5e1" }
                            }}
                          >
                            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Stack spacing={0.5} sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                  <Box
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: "4px",
                                      bgcolor: "#ffffff",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      overflow: "hidden"
                                    }}
                                  >
                                    <img
                                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                      alt=""
                                      style={{ width: 12, height: 12 }}
                                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                    />
                                  </Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                                    {bookmark.title}
                                  </Typography>
                                </Stack>

                                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                                  {bookmark.url}
                                </Typography>

                                {bookmark.notes ? (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                                    {bookmark.notes}
                                  </Typography>
                                ) : null}
                              </Stack>

                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title={isCopied ? "Copied!" : "Copy Link"}>
                                  <IconButton size="small" onClick={() => copyToClipboard(bookmark)}>
                                    {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#64748b" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Open link">
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={bookmark.url.startsWith("http") ? bookmark.url : `https://${bookmark.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink size={16} color="#64748b" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontStyle: "italic" }}>
                      No bookmarks in this collection yet.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}

          {filteredState.uncategorized.length > 0 ? (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          bgcolor: "#f1f5f9",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <BookmarkIcon size={20} />
                      </Box>
                      <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        Uncategorized Bookmarks
                      </Typography>
                    </Stack>
                    <Chip size="small" label={`${filteredState.uncategorized.length} Bookmarks`} variant="outlined" sx={{ fontWeight: 600 }} />
                  </Stack>

                  <Stack spacing={1.5} sx={{ pt: 1 }}>
                    {filteredState.uncategorized.map((bookmark) => {
                      const domain = getDomain(bookmark.url);
                      const isCopied = copiedId === bookmark.id;

                      return (
                        <Paper
                          key={bookmark.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            borderColor: "#e2e8f0",
                            bgcolor: "#f8fafc",
                            transition: "all 0.15s ease",
                            "&:hover": { bgcolor: "#ffffff", borderColor: "#cbd5e1" }
                          }}
                        >
                          <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: "4px",
                                    bgcolor: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden"
                                  }}
                                >
                                  <img
                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                    alt=""
                                    style={{ width: 12, height: 12 }}
                                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                                  {bookmark.title}
                                </Typography>
                              </Stack>

                              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                                {bookmark.url}
                              </Typography>

                              {bookmark.notes ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.5 }}>
                                  {bookmark.notes}
                                </Typography>
                              ) : null}
                            </Stack>

                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title={isCopied ? "Copied!" : "Copy Link"}>
                                <IconButton size="small" onClick={() => copyToClipboard(bookmark)}>
                                  {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#64748b" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Open link">
                                <IconButton
                                  size="small"
                                  component="a"
                                  href={bookmark.url.startsWith("http") ? bookmark.url : `https://${bookmark.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink size={16} color="#64748b" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
