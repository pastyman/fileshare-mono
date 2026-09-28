import React from "react"
import Box from "@mui/material/Box"
import { Container, DividerThin, Spacer, StyledBox, Txt } from "ui-components"

const Item = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <StyledBox uc="detailsBox" ucHover="detailsBox">
      <Txt uc="boxHeading">{title}</Txt>
      <Spacer uc="small" />
      <Box sx={{ fontSize: 14, lineHeight: 1.6 }}>{children}</Box>
    </StyledBox>
    <Spacer uc="medium" />
  </>
)

const Data = () => (
  <Container uc="main">
    <Txt uc="h1">What we collect</Txt>
    <Spacer uc="small" />
    <DividerThin />
    <Spacer uc="medium" />

    <Item title="Where it comes from">
      Nothing new is sent by the desktop app or browsers. sharefolder-web counts requests it already has to handle
      for signaling: connection polls, share-link connect requests, host handshakes and ICE/TURN lookups.
    </Item>

    <Item title="Per desktop install">
      A salted SHA-256 hash of the instance id (never the id itself, which appears in share links), plus first seen,
      last seen and the last UTC day it was active. Last seen is written at most once a minute.
    </Item>

    <Item title="Per day">
      Counters only: active apps, new installs, links opened, host handshakes and ICE lookups.
    </Item>

    <Item title="Never stored">
      IP addresses, user agents, folder ids, folder names, file names, peer ids, share passwords or transfer contents.
    </Item>
  </Container>
)

export default Data
