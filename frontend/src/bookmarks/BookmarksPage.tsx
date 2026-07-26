import { useAuth0 } from "@auth0/auth0-react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { Bookmark as BookmarkIcon, Check, Copy, ExternalLink, FileText, Folder, Globe, Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Collection, fetchCollections } from "../collections/collectionsApi";
import { Bookmark, BookmarkInput, createBookmark, deleteBookmark, fetchBookmarks, updateBookmark } from "./bookmarksApi";

type LoadState =
  | { type: "loading" }
  | { type: "ready"; bookmarks: Bookmark[]; collections: Collection[] }
  | { type: "error"; message: string };

const emptyForm: BookmarkInput = {
  url: "",
  title: "",
  notes: "",
  collectionId: null
};

export function BookmarksPage() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [state, setState] = useState<LoadState>({ type: "loading" });
  const [form, setForm] = useState<BookmarkInput>(emptyForm);
  const [filterCollectionId, setFilterCollectionId] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Bookmark | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadData(nextCollectionId = filterCollectionId, nextSearch = search) {
    if (!isAuthenticated) {
      setState({ type: "ready", bookmarks: [], collections: [] });
      return;
    }

    setState({ type: "loading" });

    try {
      const [collections, bookmarks] = await Promise.all([
        fetchCollections(getAccessTokenSilently),
        fetchBookmarks(getAccessTokenSilently, nextCollectionId || undefined, nextSearch.trim() || undefined)
      ]);
      setState({ type: "ready", collections, bookmarks });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load bookmarks"
      });
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData(filterCollectionId, search);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filterCollectionId, search, isAuthenticated]);

  async function submitBookmark(event: FormEvent) {
    event.preventDefault();
    const input = {
      ...form,
      collectionId: form.collectionId || null,
      notes: form.notes?.trim() || null
    };

    if (!input.url.trim() || !input.title.trim()) {
      return;
    }

    if (editing) {
      await updateBookmark(getAccessTokenSilently, editing.id, input);
      setEditing(null);
    } else {
      await createBookmark(getAccessTokenSilently, input);
    }

    setForm(emptyForm);
    setShowForm(false);
    await loadData();
  }

  function startEdit(bookmark: Bookmark) {
    setEditing(bookmark);
    setForm({
      url: bookmark.url,
      title: bookmark.title,
      notes: bookmark.notes ?? "",
      collectionId: bookmark.collectionId
    });
    setShowForm(true);
  }

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
          <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#e0e7ff", color: "#4f46e5" }}>
            <BookmarkIcon size={32} />
          </Box>
          <Typography variant="h5">Sign in to Access Bookmarks</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
            Your bookmarks are protected with private tenant isolation. Log in to save and manage your links.
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
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h4" component="h1">
            Bookmarks
          </Typography>
          <Typography color="text.secondary">
            Save links, assign them to collections, or keep them uncategorized.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={showForm ? <X size={18} /> : <Plus size={18} />}
          onClick={() => {
            if (showForm && editing) {
              setEditing(null);
              setForm(emptyForm);
            }
            setShowForm(!showForm);
          }}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          {showForm ? "Close Form" : "Add Bookmark"}
        </Button>
      </Stack>

      {/* Add / Edit Form Card */}
      {showForm ? (
        <Card sx={{ bgcolor: "#ffffff", borderColor: editing ? "#818cf8" : "#e2e8f0" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              {editing ? <Pencil size={18} color="#4f46e5" /> : <Plus size={18} color="#4f46e5" />}
              {editing ? "Edit Bookmark" : "Create New Bookmark"}
            </Typography>
            <Stack component="form" spacing={2} onSubmit={submitBookmark}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="URL"
                    placeholder="https://example.com"
                    value={form.url}
                    onChange={(event) => setForm({ ...form, url: event.target.value })}
                    size="small"
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Globe size={16} color="#64748b" />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Title"
                    placeholder="e.g. Bangkok Bank Official Site"
                    value={form.title}
                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                    size="small"
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Tag size={16} color="#64748b" />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Collection"
                    value={form.collectionId ?? ""}
                    onChange={(event) => setForm({ ...form, collectionId: event.target.value || null })}
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Folder size={16} color="#64748b" />
                          </InputAdornment>
                        )
                      }
                    }}
                  >
                    <MenuItem value="">Uncategorized</MenuItem>
                    {state.type === "ready"
                      ? state.collections.map((collection) => (
                          <MenuItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </MenuItem>
                        ))
                      : null}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    placeholder="Key takeaways, summary, or reminder"
                    value={form.notes ?? ""}
                    onChange={(event) => setForm({ ...form, notes: event.target.value })}
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FileText size={16} color="#64748b" />
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", pt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyForm);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained">
                  {editing ? "Save Changes" : "Save Bookmark"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {/* Filter & Search Toolbar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1 }}>
          <TextField
            placeholder="Search bookmarks by title, URL or notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{ minWidth: { sm: 300 }, flex: 1 }}
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
          <TextField
            select
            label="Filter by collection"
            value={filterCollectionId}
            onChange={(event) => setFilterCollectionId(event.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Collections</MenuItem>
            {state.type === "ready"
              ? state.collections.map((collection) => (
                  <MenuItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </MenuItem>
                ))
              : null}
          </TextField>
        </Stack>

        {state.type === "ready" ? (
          <Chip
            label={`${state.bookmarks.length} Bookmarks`}
            variant="outlined"
            sx={{ fontWeight: 600, color: "#64748b", alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        ) : null}
      </Stack>

      {/* Loading state */}
      {state.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 4, justifyContent: "center" }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Fetching your private bookmarks...</Typography>
        </Stack>
      ) : null}

      {/* Error state */}
      {state.type === "error" ? <Alert severity="error">{state.message}</Alert> : null}

      {/* Empty state */}
      {state.type === "ready" && state.bookmarks.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", bgcolor: "#ffffff", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#f1f5f9", color: "#94a3b8" }}>
              <BookmarkIcon size={32} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              No bookmarks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              {search || filterCollectionId
                ? "Try clearing your search query or collection filter."
                : "Get started by adding your first bookmark."}
            </Typography>
            {!showForm ? (
              <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => setShowForm(true)}>
                Add First Bookmark
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      {/* Bookmarks Grid */}
      {state.type === "ready" && state.bookmarks.length > 0 ? (
        <Grid container spacing={2}>
          {state.bookmarks.map((bookmark) => {
            const domain = getDomain(bookmark.url);
            const isCopied = copiedId === bookmark.id;

            return (
              <Grid key={bookmark.id} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    "&:hover": {
                      borderColor: "#818cf8"
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.5}>
                      {/* Domain Header & Collection Chip */}
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "6px",
                              bgcolor: "#f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden"
                            }}
                          >
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                              alt=""
                              style={{ width: 14, height: 14 }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>
                            {domain}
                          </Typography>
                        </Stack>

                        <Chip
                          size="small"
                          icon={<Folder size={12} />}
                          label={bookmark.collection?.name ?? "Uncategorized"}
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            bgcolor: bookmark.collection ? "#e0e7ff" : "#f1f5f9",
                            color: bookmark.collection ? "#4338ca" : "#64748b",
                            fontWeight: 600
                          }}
                        />
                      </Stack>

                      {/* Title */}
                      <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3 }}>
                        {bookmark.title}
                      </Typography>

                      {/* Notes preview */}
                      {bookmark.notes ? (
                        <Typography variant="body2" color="text.secondary" sx={{ bgcolor: "#f8fafc", p: 1.25, borderRadius: 2, fontSize: "0.85rem" }}>
                          {bookmark.notes}
                        </Typography>
                      ) : null}
                    </Stack>
                  </CardContent>

                  {/* Actions Footer */}
                  <Box sx={{ px: 2.5, pb: 2, pt: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title={isCopied ? "Copied!" : "Copy Link"}>
                        <IconButton size="small" onClick={() => copyToClipboard(bookmark)}>
                          {isCopied ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#64748b" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open in new tab">
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

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton size="small" aria-label={`Edit ${bookmark.title}`} onClick={() => startEdit(bookmark)}>
                          <Pencil size={16} color="#64748b" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          aria-label={`Delete ${bookmark.title}`}
                          onClick={() => void deleteBookmark(getAccessTokenSilently, bookmark.id).then(() => loadData())}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : null}
    </Stack>
  );
}

