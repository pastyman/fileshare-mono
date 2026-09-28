import React from "react"
import Box from "@mui/material/Box"
import Alert from "@mui/material/Alert"
import Tooltip from "@mui/material/Tooltip"
import { Container, DividerThin, LoadingCard, Spacer, StyledBox, Txt } from "ui-components"
import { useJson } from "../src/useJson"
import type { DailyRow, Overview } from "../src/stats"

const REFRESH_MS = 30_000

const StatTile = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <Box sx={{ flex: "1 1 180px", minWidth: 180 }}>
    <StyledBox uc="detailsBox" ucHover="detailsBoxHover">
      <Txt uc="boxTxt">{label}</Txt>
      <Spacer uc="small" />
      <Box sx={{ fontSize: 32, fontWeight: 600, lineHeight: 1.1 }}>{value.toLocaleString()}</Box>
      <Spacer uc="small" />
      <Box sx={{ fontSize: 12, color: "text.secondary" }}>{hint}</Box>
    </StyledBox>
  </Box>
)

const TileRow = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>{children}</Box>
)

const ActivityChart = ({ rows }: { rows: DailyRow[] }) => {
  const max = Math.max(1, ...rows.map((row) => Math.max(row.activeInstances, row.connectRequests)))
  return (
    <StyledBox uc="detailsBox" ucHover="detailsBox">
      <Txt uc="boxHeading">Last 30 days</Txt>
      <Spacer uc="small" />
      <Box sx={{ display: "flex", gap: 2, fontSize: 12, color: "text.secondary" }}>
        <span>
          <Legend color="#1976d2" /> Active apps
        </span>
        <span>
          <Legend color="#9ccc65" /> Share links opened
        </span>
      </Box>
      <Spacer uc="medium" />
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 160 }}>
        {rows.map((row) => (
          <Tooltip
            key={row.day}
            arrow
            title={`${row.day}: ${row.activeInstances} active apps, ${row.connectRequests} links opened`}
          >
            <Box sx={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", gap: "1px" }}>
              <Bar value={row.activeInstances} max={max} color="#1976d2" />
              <Bar value={row.connectRequests} max={max} color="#9ccc65" />
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "text.secondary", mt: 0.5 }}>
        <span>{rows[0]?.day}</span>
        <span>{rows[rows.length - 1]?.day}</span>
      </Box>
    </StyledBox>
  )
}

const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <Box
    sx={{
      flex: 1,
      height: `${(value / max) * 100}%`,
      minHeight: value > 0 ? 2 : 0,
      bgcolor: color,
      borderRadius: "2px 2px 0 0",
    }}
  />
)

const Legend = ({ color }: { color: string }) => (
  <Box component="span" sx={{ display: "inline-block", width: 10, height: 10, bgcolor: color, borderRadius: "2px", mr: 0.5 }} />
)

const Index = () => {
  const { data, isLoading, isError } = useJson<Overview>("/api/overview", REFRESH_MS)

  return (
    <Container uc="main">
      <Txt uc="h1">Overview</Txt>
      <Spacer uc="small" />
      <DividerThin />
      <Spacer uc="medium" />

      {isError && (
        <>
          <Alert severity="error">Could not load stats. Check MONGODB_URI and that the database is reachable.</Alert>
          <Spacer uc="medium" />
        </>
      )}

      {isLoading && <LoadingCard />}

      {data && (
        <>
          <Txt uc="boxHeading">Desktop apps</Txt>
          <Spacer uc="small" />
          <TileRow>
            <StatTile label="Online now" value={data.instances.online} hint="Polled in the last 3 minutes" />
            <StatTile label="Active today" value={data.instances.activeToday} hint="Since 00:00 UTC" />
            <StatTile label="Active 7 days" value={data.instances.active7d} hint="Rolling window" />
            <StatTile label="Active 30 days" value={data.instances.active30d} hint="Rolling window" />
            <StatTile label="Total installs" value={data.instances.total} hint={`${data.instances.newToday} new today`} />
          </TileRow>

          <Spacer uc="large" />

          <Txt uc="boxHeading">Sharing</Txt>
          <Spacer uc="small" />
          <TileRow>
            <StatTile label="Links opened today" value={data.today.connectRequests} hint={`${data.allTime.connectRequests.toLocaleString()} all time`} />
            <StatTile label="Host handshakes today" value={data.today.hostRegistrations} hint={`${data.allTime.hostRegistrations.toLocaleString()} all time`} />
            <StatTile label="ICE / TURN lookups today" value={data.today.iceRequests} hint={`${data.allTime.iceRequests.toLocaleString()} all time`} />
          </TileRow>

          <Spacer uc="large" />

          <ActivityChart rows={data.last30Days} />

          <Spacer uc="small" />
          <Box sx={{ fontSize: 12, color: "text.secondary" }}>
            Updated {new Date(data.generatedAt).toLocaleTimeString()} · refreshes every 30s
          </Box>
        </>
      )}
    </Container>
  )
}

export default Index
