import { useAuth0 } from "@auth0/auth0-react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { Clock, Folder, FolderPlus, Mail, Pencil, Plus, Search, Share2, Trash2, UserCheck, Users, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  Collection,
  CollectionShare,
  DeleteCollectionAction,
  SharePermission,
  createCollection,
  deleteCollection,
  fetchCollections,
  fetchCollectionShares,
  revokeCollectionShare,
  shareCollection,
  updateCollection
} from "../../api/collections";

type LoadState =
  | { type: "loading" }
  | { type: "ready"; collections: Collection[]; sharedCollections: Collection[] }
  | { type: "error"; message: string };

export function CollectionsPage() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();
  const [state, setState] = useState<LoadState>({ type: "loading" });
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Collection | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleteMode, setDeleteMode] = useState<"uncategorize" | "move" | "delete">("uncategorize");
  const [moveTargetId, setMoveTargetId] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<Collection | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<SharePermission>("read");
  const [shares, setShares] = useState<CollectionShare[]>([]);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isLoadingShares, setIsLoadingShares] = useState(false);
  const [revokingShareId, setRevokingShareId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function loadCollections(nextFilter = filter) {
    if (!isAuthenticated) {
      setState({ type: "ready", collections: [], sharedCollections: [] });
      return;
    }

    setState({ type: "loading" });

    try {
      const [collections, sharedCollections] = await Promise.all([
        fetchCollections(getAccessTokenSilently, nextFilter.trim() || undefined),
        fetchCollections(getAccessTokenSilently, undefined, "shared")
      ]);
      setState({ type: "ready", collections, sharedCollections });
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to load collections"
      });
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCollections(filter);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filter, isAuthenticated]);

  async function submitCollection(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    setFormError(null);
    setIsSaving(true);

    try {
      if (editing) {
        await updateCollection(getAccessTokenSilently, editing.id, trimmed);
        setEditing(null);
      } else {
        await createCollection(getAccessTokenSilently, trimmed);
      }

      setName("");
      setShowCreate(false);
      await loadCollections();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save collection");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeCollection(collection: Collection, action?: DeleteCollectionAction) {
    await deleteCollection(getAccessTokenSilently, collection.id, action);
    await loadCollections();
  }

  function startEdit(collection: Collection) {
    setEditing(collection);
    setName(collection.name);
    setFormError(null);
    setShowCreate(true);
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

  async function startShare(collection: Collection) {
    setShareTarget(collection);
    setShareEmail("");
    setSharePermission("read");
    setShareError(null);
    setShares([]);
    setIsLoadingShares(true);

    try {
      setShares(await fetchCollectionShares(getAccessTokenSilently, collection.id));
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Unable to load collection shares");
    } finally {
      setIsLoadingShares(false);
    }
  }

  async function submitShare() {
    if (!shareTarget) {
      return;
    }

    try {
      await shareCollection(getAccessTokenSilently, shareTarget.id, shareEmail, sharePermission);
      setShareEmail("");
      setSharePermission("read");
      setShares(await fetchCollectionShares(getAccessTokenSilently, shareTarget.id));
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Unable to share collection");
    }
  }

  async function revokeShare(share: CollectionShare) {
    if (!shareTarget) {
      return;
    }

    setShareError(null);
    setRevokingShareId(share.id);

    try {
      await revokeCollectionShare(getAccessTokenSilently, shareTarget.id, share.id);
      setShares(await fetchCollectionShares(getAccessTokenSilently, shareTarget.id));
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Unable to revoke collection access");
    } finally {
      setRevokingShareId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#f5f3ff", color: "#7c3aed" }}>
            <Folder size={32} />
          </Box>
          <Typography variant="h5">Sign in to Access Collections</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
            Organize bookmarks into collections with private tenant isolation. Log in to manage collections.
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
            Collections
          </Typography>
          <Typography color="text.secondary">
            Create and manage your private bookmark collections.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={showCreate ? <X size={18} /> : <Plus size={18} />}
          onClick={() => {
            if (showCreate && editing) {
              setEditing(null);
              setName("");
            }
            setShowCreate(!showCreate);
          }}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          {showCreate ? "Close Form" : "New Collection"}
        </Button>
      </Stack>

      {/* New / Edit Form */}
      {showCreate ? (
        <Card sx={{ bgcolor: "#ffffff", borderColor: editing ? "#818cf8" : "#e2e8f0" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              {editing ? <Pencil size={18} color="#4f46e5" /> : <FolderPlus size={18} color="#4f46e5" />}
              {editing ? "Edit Collection Name" : "Create New Collection"}
            </Typography>
            <Stack component="form" direction={{ xs: "column", sm: "row" }} spacing={1.5} onSubmit={submitCollection}>
              <TextField
                fullWidth
                label="Collection Name"
                placeholder="e.g. Work Tools, Reading List, Design Systems"
                value={name}
                onChange={(event) => setName(event.target.value)}
                size="small"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Folder size={16} color="#64748b" />
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Button type="submit" variant="contained" disabled={isSaving} sx={{ minWidth: 120 }}>
                {editing ? "Save" : "Create"}
              </Button>
              {editing ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditing(null);
                    setName("");
                    setShowCreate(false);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </Stack>
            {formError ? <Alert severity="error" onClose={() => setFormError(null)} sx={{ mt: 2 }}>{formError}</Alert> : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Filter Toolbar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <TextField
          placeholder="Filter collections by name..."
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          size="small"
          sx={{ minWidth: { sm: 320 } }}
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

        {state.type === "ready" ? (
          <Chip
            label={`${state.collections.length} Collections`}
            variant="outlined"
            sx={{ fontWeight: 600, color: "#64748b", alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        ) : null}
      </Stack>

      {/* Loading state */}
      {state.type === "loading" ? (
        <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 4, justifyContent: "center" }}>
          <CircularProgress size={24} />
          <Typography color="text.secondary">Fetching collections...</Typography>
        </Stack>
      ) : null}

      {/* Error state */}
      {state.type === "error" ? <Alert severity="error">{state.message}</Alert> : null}

      {/* Empty state */}
      {state.type === "ready" && state.collections.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", bgcolor: "#ffffff", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ p: 2, borderRadius: "50%", bgcolor: "#f5f3ff", color: "#7c3aed" }}>
              <Folder size={32} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              No collections found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              {filter ? "Try clearing your search query." : "Organize your bookmarks into custom folders."}
            </Typography>
            {!showCreate ? (
              <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
                Create First Collection
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ) : null}

      {/* Collections Grid */}
      {state.type === "ready" && state.collections.length > 0 ? (
        <Grid container spacing={2}>
          {state.collections.map((collection) => (
            <Grid key={collection.id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    borderColor: "#7c3aed"
                  }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: "#f5f3ff",
                            color: "#7c3aed",
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
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", fontSize: "0.8rem" }} color="text.secondary">
                      <Clock size={14} />
                      <Typography variant="caption" color="text.secondary">
                        Updated {new Date(collection.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>

                <Box sx={{ px: 2.5, pb: 2, pt: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Share2 size={14} />}
                    onClick={() => void startShare(collection)}
                    sx={{ borderRadius: "8px" }}
                  >
                    Share Access
                  </Button>

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit name">
                      <IconButton size="small" aria-label={`Edit ${collection.name}`} onClick={() => startEdit(collection)}>
                        <Pencil size={16} color="#64748b" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete collection">
                      <IconButton size="small" aria-label={`Delete ${collection.name}`} onClick={() => startDelete(collection)}>
                        <Trash2 size={16} color="#ef4444" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {/* Shared Collections Section */}
      {state.type === "ready" && state.sharedCollections.length > 0 ? (
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Users size={20} color="#4f46e5" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Shared With Me
            </Typography>
            <Chip size="small" label={`${state.sharedCollections.length}`} sx={{ bgcolor: "#e0e7ff", color: "#4338ca", fontWeight: 700 }} />
          </Stack>

          <Grid container spacing={2}>
            {state.sharedCollections.map((collection) => (
              <Grid key={collection.id} size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#f8fafc", borderColor: "#cbd5e1" }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              bgcolor: "#e0e7ff",
                              color: "#4338ca",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Folder size={20} />
                          </Box>
                          <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
                            {collection.name}
                          </Typography>
                        </Stack>
                        <Chip label="Read-Only" size="small" color="default" sx={{ fontSize: "0.7rem", fontWeight: 600 }} />
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }} color="text.secondary">
                        <UserCheck size={14} />
                        <Typography variant="caption" color="text.secondary">
                          Owner: {collection.owner?.email ?? collection.ownerId}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      ) : null}

      {/* Delete Dialog */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Collection</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Choose what should happen to bookmarks inside <strong>{deleteTarget?.name}</strong>:
            </Typography>

            <TextField
              select
              fullWidth
              label="Bookmark Action"
              value={deleteMode}
              onChange={(event) => {
                setDeleteMode(event.target.value as "uncategorize" | "move" | "delete");
                setDeleteError(null);
              }}
              size="small"
            >
              <MenuItem value="uncategorize">Keep bookmarks (Set to Uncategorized)</MenuItem>
              <MenuItem value="move">Move bookmarks to another collection</MenuItem>
              <MenuItem value="delete">Delete collection and all bookmarks inside</MenuItem>
            </TextField>

            {deleteMode === "move" ? (
              <TextField
                select
                fullWidth
                label="Target Collection"
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
              <Alert severity="warning">Bookmarks inside this collection will be permanently deleted!</Alert>
            ) : null}

            {deleteError ? <Alert severity="error">{deleteError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color={deleteMode === "delete" ? "error" : "primary"} variant="contained" onClick={() => void confirmDelete()}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareTarget !== null} onClose={() => setShareTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Share Collection "{shareTarget?.name}"</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); void submitShare(); }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="Recipient Email"
                  placeholder="peer@example.com"
                  value={shareEmail}
                  onChange={(event) => {
                    setShareEmail(event.target.value);
                    setShareError(null);
                  }}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} color="#64748b" />
                        </InputAdornment>
                      )
                    }
                  }}
                />
                <TextField
                  select
                  label="Role"
                  value={sharePermission}
                  onChange={(event) => setSharePermission(event.target.value as SharePermission)}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="edit">Edit</MenuItem>
                </TextField>
                <Button variant="contained" type="submit" sx={{ minWidth: 100 }}>
                  Share
                </Button>
              </Stack>
            </Box>

            {shareError ? <Alert severity="error">{shareError}</Alert> : null}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Active Members / Shares
              </Typography>

              {isLoadingShares ? (
                <Stack direction="row" spacing={1.5} role="status" sx={{ alignItems: "center", py: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Loading shares...
                  </Typography>
                </Stack>
              ) : shares.length > 0 ? (
                <Stack spacing={1}>
                  {shares.map((share) => (
                    <Paper key={share.id} variant="outlined" sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: "#f1f5f9" }}>
                          <Mail size={16} color="#64748b" />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {share.sharedWithUser.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permission: {share.permission}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button size="small" color="error" onClick={() => void revokeShare(share)} disabled={revokingShareId === share.id}>
                        Revoke Access
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info" sx={{ bgcolor: "#f8fafc" }}>
                  No active shares for this collection.
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setShareTarget(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

