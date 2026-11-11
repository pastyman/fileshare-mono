import React from "react"
import Box from "@mui/material/Box"
import Alert from "@mui/material/Alert"
import Tooltip from "@mui/material/Tooltip"
import { Container, DividerThin, LoadingCard, Spacer, StyledBox, Txt } from "ui-components"
import { useJson } from "../src/useJson"
import type { DailyRow, Overview } from "../src/stats"

const REFRESH_MS = 30_000

const SUCCESS = "#43a047"
const FAILED = "#e53935"

type Counters = Omit<DailyRow, "day">

const connectFailures = (row: Counters) => Math.max(0, row.pinsMatched - row.connections)
const unusedPins = (row: Counters) => Math.max(0, row.pinsCreated - row.pinsMatched)
const successRate = (row: Counters) =>
  row.pinsMatched > 0 ? `${Math.round((row.connections / row.pinsMatched) * 100)}%` : "–"

const StatTile = ({ label, value, hint }: { label: string; value: number | string; hint: string }) => (
  <Box sx={{ flex: "1 1 180px", minWidth: 180 }}>
    <StyledBox uc="detailsBox" ucHover="detailsBoxHover">
      <Txt uc="boxTxt">{label}</Txt>
      <Spacer uc="small" />
      <Box sx={{ fontSize: 32, fontWeight: 600, lineHeight: 1.1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </Box>
      <Spacer uc="small" />
      <Box sx={{ fontSize: 12, color: "text.secondary" }}>{hint}</Box>
    </StyledBox>
  </Box>
)

const TileRow = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>{children}</Box>
)

const ActivityChart = ({ rows }: { rows: DailyRow[] }) => {
  const max = Math.max(1, ...rows.map((row) => Math.max(row.connections, connectFailures(row))))
  return (
    <StyledBox uc="detailsBox" ucHover="detailsBox">
      <Txt uc="boxHeading">Last 30 days</Txt>
      <Spacer uc="small" />
      <Box sx={{ display: "flex", gap: 2, fontSize: 12, color: "text.secondary" }}>
        <span>
          <Legend color={SUCCESS} /> Successful bumps
        </span>
        <span>
          <Legend color={FAILED} /> Failed to connect
        </span>
      </Box>
      <Spacer uc="medium" />
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 160 }}>
        {rows.map((row) => (
          <Tooltip
            key={row.day}
            arrow
            title={`${row.day}: ${row.connections} successful, ${connectFailures(row)} failed, ${row.pinsCreated} PINs created`}
          >
            <Box sx={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", gap: "1px" }}>
              <Bar value={row.connections} max={max} color={SUCCESS} />
              <Bar value={connectFailures(row)} max={max} color={FAILED} />
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
          <Txt uc="boxHeading">Today (UTC)</Txt>
          <Spacer uc="small" />
          <TileRow>
            <StatTile label="Successful bumps" value={data.today.connections} hint="Peer-to-peer connection established" />
            <StatTile label="Failed to connect" value={connectFailures(data.today)} hint="PIN matched, no connection (includes in-progress)" />
            <StatTile label="Success rate" value={successRate(data.today)} hint="Successful ÷ PINs matched" />
            <StatTile label="Last hour" value={data.lastHour.connected} hint={`successful of ${data.lastHour.matched} matched`} />
          </TileRow>

          <Spacer uc="medium" />

          <TileRow>
            <StatTile label="PINs created" value={data.today.pinsCreated} hint={`${unusedPins(data.today)} not used by a receiver`} />
            <StatTile label="Wrong PIN attempts" value={data.today.pinsIncorrect} hint="Incorrect or expired" />
            <StatTile label="ICE / TURN lookups" value={data.today.iceRequests} hint="Both sides fetch once per bump" />
          </TileRow>

          <Spacer uc="large" />

          <Txt uc="boxHeading">All time</Txt>
          <Spacer uc="small" />
          <TileRow>
            <StatTile label="Successful bumps" value={data.allTime.connections} hint={`${successRate(data.allTime)} success rate`} />
            <StatTile label="Failed to connect" value={connectFailures(data.allTime)} hint="PIN matched, no connection" />
            <StatTile label="PINs created" value={data.allTime.pinsCreated} hint={`${unusedPins(data.allTime).toLocaleString()} never used`} />
            <StatTile label="Wrong PIN attempts" value={data.allTime.pinsIncorrect} hint="Incorrect or expired" />
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
