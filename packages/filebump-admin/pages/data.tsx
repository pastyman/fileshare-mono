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
      Nothing new is sent by browsers. The filebump API counts requests it already has to handle: creating a PIN,
      entering a PIN, fetching ICE/TURN servers, and the clean-up call each browser makes once its peer-to-peer
      connection is established.
    </Item>

    <Item title="What counts as successful">
      A bump is successful when the sender and receiver establish a direct connection. File contents never touch the
      server, so whether every file was then downloaded is not known.
    </Item>

    <Item title="Per bump (deleted after 1 hour)">
      A salted SHA-256 hash of the two random session ids, used only so both browsers reporting the same connection
      count once.
    </Item>

    <Item title="Per day">
      Counters only: PINs created, PINs matched, wrong PIN attempts, successful connections and ICE lookups.
    </Item>

    <Item title="Never stored">
      IP addresses, user agents, PINs, file names, file sizes, file counts or transfer contents.
    </Item>
  </Container>
)

export default Data
