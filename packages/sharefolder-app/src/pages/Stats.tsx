import * as React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

type LiveSession = {
  id: string;
  peerId: string;
  folderId: string;
  folderPath?: string;
  connectedAt: number;
};

type ActivityItem = {
  type: 'connection' | 'download' | 'preview';
  detail: string;
  folderId: string;
  bytes: number;
  createdAt: number;
};

type StatsSummary = {
  folders: { total: number; live: number; passwordProtected: number };
  users: { total: number; active: number };
  connections7d: number;
  downloads7d: number;
  bytes7d: number;
  previews7d: number;
  previewBytes7d: number;
  connectionsByDay: Array<{ date: string; count: number }>;
  downloadsByDay: Array<{ date: string; count: number; bytes: number }>;
  previewsByDay: Array<{ date: string; count: number; bytes: number }>;
  liveSessions: LiveSession[];
  recentActivity: ActivityItem[];
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)} ${units[i]}`;
}

function shortDate(isoDay: string): string {
  const [, m, d] = isoDay.split('-');
  return `${m}/${d}`;
}

function shortId(value: string, keep = 8): string {
  if (!value) return '—';
  if (value.length <= keep + 3) return value;
  return `${value.slice(0, keep)}…`;
}

function formatDuration(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

function activityLabel(type: ActivityItem['type']): string {
  if (type === 'connection') return 'Connected';
  if (type === 'preview') return 'Preview';
  return 'Download';
}

function activityColor(
  type: ActivityItem['type']
): 'success' | 'secondary' | 'primary' {
  if (type === 'connection') return 'success';
  if (type === 'preview') return 'secondary';
  return 'primary';
}

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        minWidth: 140,
        flex: '1 1 140px',
        backgroundColor: (theme) =>
          theme.custom.folderItem[theme.palette.mode].background,
        borderColor: (theme) =>
          theme.custom.folderItem[theme.palette.mode].border,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight="medium" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function panelSx(theme: any) {
  return {
    p: 2,
    backgroundColor: theme.custom.folderItem[theme.palette.mode].background,
    borderColor: theme.custom.folderItem[theme.palette.mode].border,
  };
}

export default function StatsPage() {
  const [stats, setStats] = React.useState<StatsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<number | null>(null);
  const [, setTick] = React.useState(0);

  const refresh = React.useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const summary = await window.electronAPI.dbGetStatsSummary(14);
      setStats(summary);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Failed to load stats:', err);
      if (!silent) {
        setError('Failed to load stats');
        setStats(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh(false);
  }, [refresh]);

  React.useEffect(() => {
    window.electronAPI.onStatsUpdated?.(() => {
      refresh(true);
    });
    const interval = setInterval(() => refresh(true), 3000);
    const tick = setInterval(() => setTick((n) => n + 1), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [refresh]);

  const hasConnectionData =
    !!stats && stats.connectionsByDay.some((d) => d.count > 0);
  const hasDownloadData =
    !!stats && stats.downloadsByDay.some((d) => d.count > 0 || d.bytes > 0);
  const hasPreviewData =
    !!stats && stats.previewsByDay.some((d) => d.count > 0 || d.bytes > 0);

  const liveSessions = stats?.liveSessions || [];
  const recentActivity = stats?.recentActivity || [];
  const now = Date.now();

  return (
    <Box p={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5">Stats</Typography>
          <Chip
            label="LIVE"
            size="small"
            color="success"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {loading && <CircularProgress size={20} />}
          <Button
            variant="outlined"
            onClick={() => refresh(false)}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!stats && loading ? (
        <Typography color="text.secondary">Loading stats…</Typography>
      ) : stats ? (
        <Stack spacing={3}>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            <KpiCard label="Live now" value={liveSessions.length} />
            <KpiCard label="Connections (7d)" value={stats.connections7d} />
            <KpiCard label="Previews (7d)" value={stats.previews7d} />
            <KpiCard
              label="Preview bytes (7d)"
              value={formatBytes(stats.previewBytes7d)}
            />
            <KpiCard label="Downloads (7d)" value={stats.downloads7d} />
            <KpiCard
              label="Download bytes (7d)"
              value={formatBytes(stats.bytes7d)}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="stretch"
          >
            <Paper variant="outlined" sx={(theme) => ({ ...panelSx(theme), flex: 1, minHeight: 280 })}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Live connections
                </Typography>
                <Chip
                  size="small"
                  label={`${liveSessions.length} active`}
                  color={liveSessions.length > 0 ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Stack>
              {liveSessions.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No visitors connected right now.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Peer</TableCell>
                      <TableCell>Folder</TableCell>
                      <TableCell align="right">Connected</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liveSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                          {shortId(session.peerId)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap title={session.folderPath || session.folderId}>
                            {session.folderPath
                              ? session.folderPath.split(/[/\\]/).pop()
                              : shortId(session.folderId)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(now - session.connectedAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Paper>

            <Paper variant="outlined" sx={(theme) => ({ ...panelSx(theme), flex: 1.2, minHeight: 280, maxHeight: 360, overflow: 'auto' })}>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Action log
              </Typography>
              {recentActivity.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Connections, previews, and downloads will appear here as they
                  happen.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {recentActivity.map((item, index) => (
                    <Stack
                      key={`${item.type}-${item.createdAt}-${index}`}
                      direction="row"
                      spacing={1}
                      alignItems="flex-start"
                    >
                      <Chip
                        size="small"
                        label={activityLabel(item.type)}
                        color={activityColor(item.type)}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem', minWidth: 76 }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          title={item.detail}
                          sx={{ fontFamily: item.type === 'connection' ? 'monospace' : undefined }}
                        >
                          {item.type === 'connection'
                            ? shortId(item.detail, 12)
                            : item.detail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.createdAt).toLocaleTimeString()}
                          {item.bytes > 0 ? ` · ${formatBytes(item.bytes)}` : ''}
                          {` · ${shortId(item.folderId, 6)}`}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>

          <Paper variant="outlined" sx={(theme) => panelSx(theme)}>
            <Typography variant="subtitle1" fontWeight="medium" mb={1}>
              Connections (14 days)
            </Typography>
            {!hasConnectionData ? (
              <Typography color="text.secondary" variant="body2">
                Share a folder and wait for visitors — connection activity will
                show up here.
              </Typography>
            ) : (
              <LineChart
                height={260}
                xAxis={[
                  {
                    data: stats.connectionsByDay.map((d) => shortDate(d.date)),
                    scaleType: 'point',
                  },
                ]}
                series={[
                  {
                    data: stats.connectionsByDay.map((d) => d.count),
                    label: 'Connections',
                    color: '#2e7d32',
                    area: true,
                  },
                ]}
              />
            )}
          </Paper>

          <Paper variant="outlined" sx={(theme) => panelSx(theme)}>
            <Typography variant="subtitle1" fontWeight="medium" mb={1}>
              Previews (14 days)
            </Typography>
            {!hasPreviewData ? (
              <Typography color="text.secondary" variant="body2">
                Image/video tile previews will appear here as visitors browse.
              </Typography>
            ) : (
              <Stack spacing={2}>
                <BarChart
                  height={240}
                  xAxis={[
                    {
                      data: stats.previewsByDay.map((d) => shortDate(d.date)),
                      scaleType: 'band',
                    },
                  ]}
                  series={[
                    {
                      data: stats.previewsByDay.map((d) => d.count),
                      label: 'Previews',
                      color: '#7b1fa2',
                    },
                  ]}
                />
                <LineChart
                  height={240}
                  xAxis={[
                    {
                      data: stats.previewsByDay.map((d) => shortDate(d.date)),
                      scaleType: 'point',
                    },
                  ]}
                  series={[
                    {
                      data: stats.previewsByDay.map((d) =>
                        Math.round((d.bytes / (1024 * 1024)) * 10) / 10
                      ),
                      label: 'Preview MB',
                      color: '#ab47bc',
                      area: true,
                    },
                  ]}
                />
              </Stack>
            )}
          </Paper>

          <Paper variant="outlined" sx={(theme) => panelSx(theme)}>
            <Typography variant="subtitle1" fontWeight="medium" mb={1}>
              Downloads (14 days)
            </Typography>
            {!hasDownloadData ? (
              <Typography color="text.secondary" variant="body2">
                Full-file downloads will appear here once visitors save files
                from a shared folder.
              </Typography>
            ) : (
              <Stack spacing={2}>
                <BarChart
                  height={240}
                  xAxis={[
                    {
                      data: stats.downloadsByDay.map((d) => shortDate(d.date)),
                      scaleType: 'band',
                    },
                  ]}
                  series={[
                    {
                      data: stats.downloadsByDay.map((d) => d.count),
                      label: 'Downloads',
                      color: '#1565c0',
                    },
                  ]}
                />
                <LineChart
                  height={240}
                  xAxis={[
                    {
                      data: stats.downloadsByDay.map((d) => shortDate(d.date)),
                      scaleType: 'point',
                    },
                  ]}
                  series={[
                    {
                      data: stats.downloadsByDay.map((d) =>
                        Math.round((d.bytes / (1024 * 1024)) * 10) / 10
                      ),
                      label: 'Download MB',
                      color: '#ed6c02',
                      area: true,
                    },
                  ]}
                />
              </Stack>
            )}
          </Paper>

          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            <KpiCard label="Folders" value={stats.folders.total} />
            <KpiCard label="Live folders" value={stats.folders.live} />
            <KpiCard label="Users" value={stats.users.total} />
            <KpiCard label="Active users" value={stats.users.active} />
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="stretch"
          >
            <Paper variant="outlined" sx={(theme) => ({ ...panelSx(theme), flex: 1, minHeight: 280 })}>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Folders
              </Typography>
              {stats.folders.total === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No folders yet.
                </Typography>
              ) : (
                <PieChart
                  height={220}
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: stats.folders.live,
                          label: 'Live',
                          color: '#2e7d32',
                        },
                        {
                          id: 1,
                          value: Math.max(
                            0,
                            stats.folders.total - stats.folders.live
                          ),
                          label: 'Offline',
                          color: '#9e9e9e',
                        },
                      ],
                      innerRadius: 40,
                      paddingAngle: 2,
                    },
                  ]}
                />
              )}
            </Paper>

            <Paper variant="outlined" sx={(theme) => ({ ...panelSx(theme), flex: 1, minHeight: 280 })}>
              <Typography variant="subtitle1" fontWeight="medium" mb={1}>
                Users
              </Typography>
              {stats.users.total === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No users yet.
                </Typography>
              ) : (
                <PieChart
                  height={220}
                  series={[
                    {
                      data: [
                        {
                          id: 0,
                          value: stats.users.active,
                          label: 'Active',
                          color: '#1565c0',
                        },
                        {
                          id: 1,
                          value: Math.max(
                            0,
                            stats.users.total - stats.users.active
                          ),
                          label: 'Inactive',
                          color: '#bdbdbd',
                        },
                      ],
                      innerRadius: 40,
                      paddingAngle: 2,
                    },
                  ]}
                />
              )}
            </Paper>
          </Stack>
        </Stack>
      ) : null}
    </Box>
  );
}
