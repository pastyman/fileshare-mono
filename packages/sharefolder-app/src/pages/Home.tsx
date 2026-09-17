// src/renderer/pages/Home.tsx
import * as React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, IconButton, Stack, Typography, FormControlLabel, Switch, TextField, Chip, Link, Tooltip, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// Database types and operations now handled via IPC
interface FolderEntry {
  id?: number;
  guid: string;
  path: string;
  createdAt: number;
  isLive?: boolean;
  isPasswordProtected?: boolean;
}
import { getFolderWebUrl } from '../renderer/config';
import TruncatedText from '../components/TruncatedText';

export default function Home() {
  const [folders, setFolders] = React.useState<FolderEntry[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingFolder, setEditingFolder] = React.useState<FolderEntry | null>(null);
  const [editForm, setEditForm] = React.useState({
    isLive: false,
    isPasswordProtected: false
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [folderUrls, setFolderUrls] = React.useState<Record<string, string>>({});
  const [instanceId, setInstanceId] = React.useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [folderToDelete, setFolderToDelete] = React.useState<FolderEntry | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Refreshing folders...');

      // Small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const rows = await window.electronAPI.dbListFolders();
      console.log('Folders loaded:', rows);
      setFolders(rows);

      // Generate URLs for all folders
      const urls: Record<string, string> = {};
      for (const folder of rows) {
        if (instanceId) {
          urls[folder.guid] = getFolderWebUrl(instanceId, folder.guid);
        }
      }
      setFolderUrls(urls);
    } catch (error) {
      console.error('Error refreshing folders:', error);
      setError('Failed to load folders');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  React.useEffect(() => {
    // Get instance ID
    window.electronAPI.dbGetInstance().then(instance => {
      setInstanceId(instance);
    });

    // Debug database status
    window.electronAPI.dbDebug().then(debugInfo => {
      console.log('Database debug info:', debugInfo);
    });
  }, []);

  // Refresh folders when instance ID changes
  React.useEffect(() => {
    if (instanceId) {
      refresh();
    }
  }, [instanceId, refresh]);

  const handleAddClick = async () => {
    setBusy(true);
    try {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        await window.electronAPI.dbAddFolder(path);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id?: number) => {
    if (!id) return;
    setBusy(true);
    try {
      await window.electronAPI.dbRemoveFolder(id);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = (folder: FolderEntry) => {
    setFolderToDelete(folder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!folderToDelete?.id) return;
    setBusy(true);
    try {
      await window.electronAPI.dbRemoveFolder(folderToDelete.id);
      await refresh();
      setDeleteDialogOpen(false);
      setFolderToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFolderToDelete(null);
  };

  const handleEditClick = (folder: FolderEntry) => {
    setEditingFolder(folder);
    setEditForm({
      isLive: folder.isLive || false,
      isPasswordProtected: folder.isPasswordProtected || false
    });
    setEditDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingFolder(null);
    setEditForm({
      isLive: false,
      isPasswordProtected: false
    });
  };

  const handleEditSave = async () => {
    if (!editingFolder?.id) return;
    setBusy(true);
    try {
      await window.electronAPI.dbUpdateFolder(editingFolder.id, editForm);
      await refresh();
      setEditDialogOpen(false);
      setEditingFolder(null);
    } finally {
      setBusy(false);
    }
  };



  const handleCopyUrl = async (guid: string) => {
    const url = folderUrls[guid];
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        // You could add a toast notification here
        console.log('URL copied to clipboard:', url);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  const handleOpenInBrowser = (guid: string) => {
    const url = folderUrls[guid];
    if (url) {
      // Use Electron's shell API to open in default browser
      window.electronAPI.openExternal(url);
    }
  };

  return (
    <Box p={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Folders</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {loading && (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          )}
          <Button variant="outlined" onClick={refresh} disabled={busy || loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} disabled={busy}>
            Add Folder
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Box textAlign="center" py={2}>
          <Typography variant="body1" color="error" gutterBottom>{error}</Typography>
          <Button variant="outlined" onClick={refresh} disabled={busy}>
            Retry
          </Button>
        </Box>
      )}

      {folders.length === 0 && !loading && !error ? (
        <Typography variant="body1" color="text.secondary">No folders yet. Click "Add Folder" to begin.</Typography>
      ) : (
        <Box>
          {folders.map(f => (
            <Box
              key={f.id}
              sx={{
                backgroundColor: (theme) => theme.custom.folderItem[theme.palette.mode].background,
                border: (theme) => `1px solid ${theme.custom.folderItem[theme.palette.mode].border}`,
                borderRadius: 1,
                mb: 1,
                position: 'relative',
                p: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              {/* Status Icons - Top Right Corner */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5
                }}
              >
                {f.isLive && (
                  <Chip
                    label="LIVE"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                {f.isPasswordProtected && (
                  <Chip
                    label="🔒"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5
                  }}
                >
                  {f.path}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Folder ID: {f.guid}
                </Typography>

                {!instanceId ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Loading URL...
                  </Typography>
                ) : folderUrls[f.guid] ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <TruncatedText
                        text={`${folderUrls[f.guid]}`}
                        variant="body2"
                        color="primary"
                        sx={{
                          fontFamily: 'monospace'
                        }}
                      />
                    </Box>
                    <Tooltip title="Copy URL">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyUrl(f.guid)}
                        sx={{ ml: 1, flexShrink: 0 }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Open in Browser">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenInBrowser(f.guid)}
                        sx={{ ml: 0.5, flexShrink: 0 }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    URL not available
                  </Typography>
                )}
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditClick(f)}
                  disabled={busy}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteClick(f)}
                  disabled={busy}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Folder Settings</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isLive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isLive: e.target.checked }))}
                />
              }
              label="Make Live"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isPasswordProtected}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isPasswordProtected: e.target.checked }))}
                />
              }
              label="Password Protect"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} disabled={busy}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={busy}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete folder "{folderToDelete?.path}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={busy}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={busy}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
