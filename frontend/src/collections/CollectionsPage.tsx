import { useAuth0 } from "@auth0/auth0-react";
import { Alert, Box, Button, CircularProgress, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Collection, createCollection, deleteCollection, fetchCollections, updateCollection } from "./collectionsApi";

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

  async function removeCollection(collection: Collection) {
    await deleteCollection(getAccessTokenSilently, collection.id);
    await loadCollections();
  }

  function startEdit(collection: Collection) {
    setEditing(collection);
    setName(collection.name);
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
                <IconButton aria-label={`Delete ${collection.name}`} onClick={() => void removeCollection(collection)}>
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
