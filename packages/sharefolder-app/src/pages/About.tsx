import * as React from 'react';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { ShareFolderMark } from '../components/ShareFolderMark';

export default function AboutPage() {
  const [version, setVersion] = React.useState('');
  const [platform, setPlatform] = React.useState('');

  React.useEffect(() => {
    window.electronAPI
      .getAppInfo()
      .then((info) => {
        setVersion(info.version);
        setPlatform(info.platform);
      })
      .catch(() => {
        setVersion('1.0.0');
      });
  }, []);

  return (
    <Box p={3} maxWidth={640}>
      <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
        <ShareFolderMark size={72} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            ShareFolder
          </Typography>
          <Typography color="text.secondary">
            Version {version || '…'}
            {platform ? ` · ${platform}` : ''}
          </Typography>
        </Box>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
        <Typography sx={{ mb: 1.5 }}>
          Share a local folder from this app. Anyone with the link can browse and
          download over a direct peer connection — files stay on your machine
          until someone requests them.
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Keep ShareFolder running while links are in use. Password-protected
          folders require a user from the Users page.
        </Typography>
      </Paper>

      <Button
        variant="outlined"
        onClick={() => window.electronAPI.openExternal('https://sharefolder.io')}
      >
        Open sharefolder.io
      </Button>
    </Box>
  );
}
