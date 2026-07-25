import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Box, Button, CircularProgress, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
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
  const [editing, setEditing] = useState<Bookmark | null>(null);

  async function loadData(nextCollectionId = filterCollectionId) {
    if (!isAuthenticated) {
      setState({ type: "ready", bookmarks: [], collections: [] });
      return;
    }

    setState({ type: "loading" });

    try {
      const [collections, bookmarks] = await Promise.all([
        fetchCollections(getAccessTokenSilently),
        fetchBookmarks(getAccessTokenSilently, nextCollectionId || undefined)
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
    void loadData();
  }, [isAuthenticated]);

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
  }

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
        Log in to manage bookmarks.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Bookmarks
        </Typography>
        <Typography color="text.secondary">Save links, assign them to collections, or keep them uncategorized.</Typography>
      </Box>

      <Stack component="form" spacing={1.5} onSubmit={submitBookmark} sx={{ maxWidth: 720 }}>
        <TextField label="URL" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} size="small" />
        <TextField label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} size="small" />
        <TextField
          label="Notes"
          value={form.notes ?? ""}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          size="small"
          multiline
          minRows={2}
        />
        <TextField
          select
          label="Collection"
          value={form.collectionId ?? ""}
          onChange={(event) => setForm({ ...form, collectionId: event.target.value || null })}
          size="small"
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
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained">
            {editing ? "Save" : "Create"}
          </Button>
          {editing ? (
            <Button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <TextField
          select
          label="Filter by collection"
          value={filterCollectionId}
          onChange={(event) => setFilterCollectionId(event.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        >
          <MenuItem value="">All bookmarks</MenuItem>
          {state.type === "ready"
            ? state.collections.map((collection) => (
                <MenuItem key={collection.id} value={collection.id}>
                  {collection.name}
                </MenuItem>
              ))
            : null}
        </TextField>
        <Button variant="outlined" onClick={() => void loadData()}>
          Apply
        </Button>
      </Stack>

      {state.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography>Loading bookmarks</Typography>
        </Stack>
      ) : null}

      {state.type === "error" ? <Alert severity="error">{state.message}</Alert> : null}

      {state.type === "ready" && state.bookmarks.length === 0 ? <Alert severity="info">No bookmarks found.</Alert> : null}

      {state.type === "ready" && state.bookmarks.length > 0 ? (
        <Stack spacing={1.5}>
          {state.bookmarks.map((bookmark) => (
            <Stack
              key={bookmark.id}
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                px: 2,
                py: 1.5
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{bookmark.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {bookmark.collection?.name ?? "Uncategorized"} - {bookmark.url}
                </Typography>
                {bookmark.notes ? (
                  <Typography variant="body2" color="text.secondary">
                    {bookmark.notes}
                  </Typography>
                ) : null}
              </Box>
              <Stack direction="row" spacing={0.5}>
                <IconButton aria-label={`Edit ${bookmark.title}`} onClick={() => startEdit(bookmark)}>
                  <Pencil size={18} />
                </IconButton>
                <IconButton aria-label={`Delete ${bookmark.title}`} onClick={() => void deleteBookmark(getAccessTokenSilently, bookmark.id).then(() => loadData())}>
                  <Trash2 size={18} />
                </IconButton>
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
