import { useAuth0 } from "@auth0/auth0-react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  Collection,
  DeleteCollectionAction,
  createCollection,
  deleteCollection,
  fetchCollections,
  updateCollection
} from "./collectionsApi";

type LoadState =
  | { type: "loading" }
  | { type: "ready"; collections: Collection[] }
  | { type: "error"; message: string };

export function CollectionsPage() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [state, setState] = useState<LoadState>({ type: "loading" });
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Collection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleteMode, setDeleteMode] = useState<"uncategorize" | "move" | "delete">("uncategorize");
  const [moveTargetId, setMoveTargetId] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadCollections(nextFilter = filter) {
    if (!isAuthenticated) {
      setState({ type: "ready", collections: [] });
      return;
    }

    setState({ type: "loading" });

    try {
      const collections = await fetchCollections(getAccessTokenSilently, nextFilter.trim() || undefined);
      setState({ type: "ready", collections });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load collections"
      });
    }
  }

  useEffect(() => {
    void loadCollections();
  }, [isAuthenticated]);

  async function submitCollection(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    if (editing) {
      await updateCollection(getAccessTokenSilently, editing.id, trimmed);
      setEditing(null);
    } else {
      await createCollection(getAccessTokenSilently, trimmed);
    }

    setName("");
    await loadCollections();
  }

  async function removeCollection(collection: Collection, action?: DeleteCollectionAction) {
    await deleteCollection(getAccessTokenSilently, collection.id, action);
    await loadCollections();
  }

  function startEdit(collection: Collection) {
    setEditing(collection);
    setName(collection.name);
  }

  function startDelete(collection: Collection) {
    setDeleteTarget(collection);
    setDeleteMode("uncategorize");
    setMoveTargetId("");
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const action =
      deleteMode === "move"
        ? ({ bookmarkAction: "move", targetCollectionId: moveTargetId } as const)
        : ({ bookmarkAction: deleteMode } as const);

    if (deleteMode === "move" && !moveTargetId) {
      setDeleteError("Choose a collection to move bookmarks into.");
      return;
    }

    try {
      await removeCollection(deleteTarget, action);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete collection");
    }
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
        Log in to manage collections.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Collections
        </Typography>
        <Typography color="text.secondary">Create and manage your private bookmark collections.</Typography>
      </Box>

      <Stack component="form" direction={{ xs: "column", sm: "row" }} spacing={1.5} onSubmit={submitCollection}>
        <TextField
          label={editing ? "Collection name" : "New collection"}
          value={name}
          onChange={(event) => setName(event.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />
        <Button type="submit" variant="contained">
          {editing ? "Save" : "Create"}
        </Button>
        {editing ? (
          <Button
            type="button"
            variant="text"
            onClick={() => {
              setEditing(null);
              setName("");
            }}
          >
            Cancel
          </Button>
        ) : null}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <TextField
          label="Filter by name"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />
        <Button variant="outlined" onClick={() => void loadCollections()}>
          Apply
        </Button>
      </Stack>

      {state.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center" }}>
          <CircularProgress size={20} />
          <Typography>Loading collections</Typography>
        </Stack>
      ) : null}

      {state.type === "error" ? <Alert severity="error">{state.message}</Alert> : null}

      {state.type === "ready" && state.collections.length === 0 ? (
        <Alert severity="info">No collections found.</Alert>
      ) : null}

      {state.type === "ready" && state.collections.length > 0 ? (
        <Stack spacing={1.5}>
          {state.collections.map((collection) => (
            <Stack
              key={collection.id}
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
                <Typography sx={{ fontWeight: 600 }}>{collection.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated {new Date(collection.updatedAt).toLocaleString()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5}>
                <IconButton aria-label={`Edit ${collection.name}`} onClick={() => startEdit(collection)}>
                  <Pencil size={18} />
                </IconButton>
                <IconButton aria-label={`Delete ${collection.name}`} onClick={() => startDelete(collection)}>
                  <Trash2 size={18} />
                </IconButton>
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : null}

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Delete collection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>
              Choose what should happen to bookmarks in {deleteTarget?.name}. Empty collections will be deleted
              immediately with any option.
            </Typography>
            <TextField
              select
              label="Bookmark action"
              value={deleteMode}
              onChange={(event) => {
                setDeleteMode(event.target.value as "uncategorize" | "move" | "delete");
                setDeleteError(null);
              }}
              size="small"
            >
              <MenuItem value="uncategorize">Make bookmarks uncategorized</MenuItem>
              <MenuItem value="move">Move bookmarks to another collection</MenuItem>
              <MenuItem value="delete">Delete bookmarks too</MenuItem>
            </TextField>
            {deleteMode === "move" ? (
              <TextField
                select
                label="Move to"
                value={moveTargetId}
                onChange={(event) => setMoveTargetId(event.target.value)}
                size="small"
              >
                {state.type === "ready"
                  ? state.collections
                      .filter((collection) => collection.id !== deleteTarget?.id)
                      .map((collection) => (
                        <MenuItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </MenuItem>
                      ))
                  : null}
              </TextField>
            ) : null}
            {deleteMode === "delete" ? (
              <Alert severity="warning">Bookmarks in this collection will be permanently deleted.</Alert>
            ) : null}
            {deleteError ? <Alert severity="error">{deleteError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color={deleteMode === "delete" ? "error" : "primary"} variant="contained" onClick={() => void confirmDelete()}>
            Delete collection
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
