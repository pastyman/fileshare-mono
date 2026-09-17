import * as React from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';

interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  lastCheck: Date | null;
  error?: string;
  connections?: Array<{ peerId: string; folderId: string }>;
}

// Helper function to validate status
function isValidStatus(status: string): status is 'connected' | 'disconnected' | 'checking' | 'error' {
  return ['connected', 'disconnected', 'checking', 'error'].includes(status);
}

interface ConnectionStatusProps {
  open?: boolean;
}

export default function ConnectionStatus({ open = true }: ConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>({
    status: 'checking',
    lastCheck: null
  });
  const [instanceGuid, setInstanceGuid] = React.useState<string>('');

  // Initialize instance GUID and start polling
  React.useEffect(() => {
    window.electronAPI.dbGetInstance().then(async (guid) => {
      setInstanceGuid(guid);
      
      // Start polling from main process
      try {
        await window.electronAPI.startConnectionPolling(guid);
      } catch (error) {
        console.error('Failed to start connection polling:', error);
      }
    });

    // Listen for connection status updates from main process
    window.electronAPI.onConnectionStatusUpdate((data) => {
      setConnectionStatus({
        status: isValidStatus(data.status) ? data.status : 'error',
        lastCheck: new Date(data.lastCheck),
        error: data.error,
        connections: data.connections
      });
      
      // Handle new connections - send to main process to open RTC windows
      if (data.connections && Array.isArray(data.connections) && data.connections.length > 0) {
        window.electronAPI.sendNewConnections(data.connections);
      }
    });

    // Cleanup on unmount
    return () => {
      window.electronAPI.stopConnectionPolling().catch(console.error);
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected': return 'success';
      case 'disconnected': return 'warning';
      case 'error': return 'error';
      case 'checking': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (connectionStatus.status) {
      case 'connected': return 'CONNECTED';
      case 'disconnected': return 'DISCONNECTED';
      case 'error': return 'ERROR';
      case 'checking': return 'CHECKING';
      default: return 'UNKNOWN';
    }
  };

  const getStatusIcon = () => {
    if (connectionStatus.status === 'checking') {
      return <CircularProgress size={12} />;
    }
    return null;
  };

  // When drawer is collapsed, show just a colored circle
  if (!open) {
    return (
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pt: 2,
        pb: 2
      }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: connectionStatus.status === 'checking' 
              ? 'grey.400' 
              : connectionStatus.status === 'connected' 
                ? 'success.main' 
                : connectionStatus.status === 'disconnected' 
                  ? 'warning.main' 
                  : 'error.main',
            border: '2px solid',
            borderColor: 'background.paper',
            boxShadow: 1
          }}
        />
      </Box>
    );
  }

  // Full component when drawer is expanded
  return (
    <Box sx={{ 
      pt: 2,
      pb: 2,
      pl: 0,
      pr: 2,
      backgroundColor: 'transparent'
    }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Connection Status
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={getStatusLabel()}
          size="small"
          color={getStatusColor() as any}
          variant="outlined"
          icon={getStatusIcon()}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Box>
      
      {connectionStatus.lastCheck && (
        <Typography variant="caption" color="text.secondary">
          Last check: {connectionStatus.lastCheck.toLocaleTimeString()}
        </Typography>
      )}
      
      {connectionStatus.error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
          Error: {connectionStatus.error}
        </Typography>
      )}
      
      {instanceGuid && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Instance: {instanceGuid.substring(0, 8)}...
        </Typography>
      )}
    </Box>
  );
}
