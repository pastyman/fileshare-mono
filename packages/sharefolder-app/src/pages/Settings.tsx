import * as React from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

export default function SettingsPage() {
  const [openAtLogin, setOpenAtLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isPackaged, setIsPackaged] = React.useState(false);
  const [platform, setPlatform] = React.useState('');

  React.useEffect(() => {
    Promise.all([
      window.electronAPI.getPrefs(),
      window.electronAPI.getAppInfo(),
    ])
      .then(([prefs, info]) => {
        setOpenAtLogin(prefs.openAtLogin);
        setIsPackaged(info.isPackaged);
        setPlatform(info.platform);
      })
      .catch((error) => console.error('Failed to load settings:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (checked: boolean) => {
    setOpenAtLogin(checked);
    setSaving(true);
    try {
      const result = await window.electronAPI.setOpenAtLogin(checked);
      setOpenAtLogin(result.openAtLogin);
      setIsPackaged(result.applied);
      setPlatform(result.platform);
    } catch (error) {
      console.error('Failed to update open-at-login:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={3} maxWidth={640}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Prefer quiet defaults — ShareFolder stays ready to accept share links.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={openAtLogin}
              disabled={loading || saving}
              onChange={(e) => handleToggle(e.target.checked)}
              color="success"
            />
          }
          label={
            <Box>
              <Typography fontWeight={600}>Open ShareFolder at login</Typography>
              <Typography variant="body2" color="text.secondary">
                Start automatically when you sign in to this computer (Windows
                Startup, macOS Login Items, Linux autostart).
              </Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', m: 0, gap: 1 }}
        />
      </Paper>

      {!loading && !isPackaged && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Startup registration applies to installed builds. You&apos;re in
          development mode{platform ? ` (${platform})` : ''}; the preference is
          saved and will activate after install.
        </Alert>
      )}
    </Box>
  );
}
