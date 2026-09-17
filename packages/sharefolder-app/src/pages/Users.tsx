import * as React from "react";
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Stack, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch, 
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
// Database types and operations now handled via IPC
interface UserEntry {
  id?: number;
  username: string;
  email: string;
  fullName: string;
  password: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Add/Edit dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserEntry | null>(null);
  const [userForm, setUserForm] = React.useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    isActive: true
  });

  // Email validation state
  const [emailError, setEmailError] = React.useState<string | null>(null);

  // Email validation function
  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    // Check for common issues
    if (email.length > 254) {
      return { isValid: false, error: 'Email address is too long' };
    }
    
    if (email.includes('..') || email.includes('--')) {
      return { isValid: false, error: 'Email address contains invalid characters' };
    }
    
    return { isValid: true };
  };

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<UserEntry | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await window.electronAPI.dbListUsers();
      setUsers(rows);
    } catch (error) {
      console.error('Error refreshing users:', error);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddClick = () => {
    setEditingUser(null);
    setEmailError(null); // Clear any previous email errors
    setUserForm({
      username: '',
      email: '',
      fullName: '',
      password: '',
      isActive: true
    });
    setDialogOpen(true);
  };

  const handleEditClick = (user: UserEntry) => {
    setEditingUser(user);
    setEmailError(null); // Clear any previous email errors
    setUserForm({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      password: '', // Password is not editable
      isActive: user.isActive
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setEmailError(null);
    setUserForm({
      username: '',
      email: '',
      fullName: '',
      password: '',
      isActive: true
    });
  };

  const handleSave = async () => {
    // Clear previous errors
    setError(null);
    setEmailError(null);

    if (!userForm.username.trim() || !userForm.email.trim() || !userForm.fullName.trim()) {
      setError('All fields are required');
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(userForm.email.trim());
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    // Password is required for new users, but not for editing existing users
    if (!editingUser && !userForm.password.trim()) {
      setError('Password is required for new users');
      return;
    }

    setBusy(true);
    try {
      if (editingUser) {
        // For editing, only update non-password fields
        const { password, ...updateData } = userForm;
        await window.electronAPI.dbUpdateUser(editingUser.id!, updateData);
      } else {
        await window.electronAPI.dbAddUser(userForm);
      }
      await refresh();
      handleDialogClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteClick = (user: UserEntry) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete?.id) return;
    setBusy(true);
    try {
      await window.electronAPI.dbRemoveUser(userToDelete.id);
      await refresh();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  return (
    <Box p={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Users</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {loading && (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          )}
          <Button variant="outlined" onClick={refresh} disabled={busy || loading}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} disabled={busy}>
            Add User
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {users.length === 0 && !loading ? (
        <Typography variant="body1" color="text.secondary">No users yet. Click "Add User" to begin.</Typography>
      ) : (
        <List>
          {users.map(user => (
            <ListItem
              key={user.id}
              sx={{
                backgroundColor: (theme) => user.isActive 
                  ? theme.custom.userItem[theme.palette.mode].activeBackground
                  : theme.custom.userItem[theme.palette.mode].inactiveBackground,
                border: (theme) => `1px solid ${theme.custom.userItem[theme.palette.mode].border}`,
                borderRadius: 1,
                mb: 1,
                opacity: user.isActive ? 1 : 0.7,
                position: 'relative',
                pr: 8 // Make room for status icons
              }}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <IconButton 
                    edge="end" 
                    aria-label="edit" 
                    onClick={() => handleEditClick(user)} 
                    disabled={busy}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    onClick={() => handleDeleteClick(user)} 
                    disabled={busy}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
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
                {user.isActive && (
                  <Chip 
                    label="ACTIVE" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>

              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="medium">
                    {user.fullName}
                  </Typography>
                }
                secondary={
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Username: {user.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                      {user.updatedAt !== user.createdAt && 
                        ` • Updated: ${new Date(user.updatedAt).toLocaleDateString()}`
                      }
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              value={userForm.username}
              onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
              fullWidth
              required
              disabled={busy}
            />
            
            <TextField
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => {
                const email = e.target.value;
                setUserForm(prev => ({ ...prev, email }));
                // Clear email error when user starts typing
                if (emailError) {
                  setEmailError(null);
                }
                // Real-time validation (optional - you can remove this if you prefer validation only on save)
                if (email) {
                  const validation = validateEmail(email);
                  if (!validation.isValid) {
                    setEmailError(validation.error || 'Please enter a valid email address');
                  } else {
                    setEmailError(null);
                  }
                }
              }}
              fullWidth
              required
              disabled={busy}
              error={!!emailError}
              helperText={emailError || "Enter a valid email address (e.g., user@example.com)"}
            />
            
            <TextField
              label="Full Name"
              value={userForm.fullName}
              onChange={(e) => setUserForm(prev => ({ ...prev, fullName: e.target.value }))}
              fullWidth
              required
              disabled={busy}
            />
            
            <TextField
              label="Password"
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              fullWidth
              required={!editingUser}
              disabled={busy}
              helperText={editingUser ? "Leave blank to keep current password" : "Password is required for new users"}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  disabled={busy}
                />
              }
              label="Active Account"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={busy}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={busy}>
            {busy ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete user "{userToDelete?.fullName}" ({userToDelete?.username})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={busy}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={busy}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
