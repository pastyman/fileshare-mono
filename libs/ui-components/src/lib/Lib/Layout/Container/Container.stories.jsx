import React from "react"

import Container from "../Container"

export default {
  title: "Layout/Container",
  component: Container,
}

export const solidBox = () => (
  <Container uc="solidBox">
    I am a solid box container my style matches the uc (use class) name from the
    theme file
  </Container>
)

export const wizardBox = () => (
  <Container uc="wizardBox">
    I am a wizard box container my style matches the uc (use class) name from
    the theme file
  </Container>
)

export const dashedBox = () => (
  <Container uc="dashedBox">
    I am a dashed box container my style matches the uc (use class) name from
    the theme file
  </Container>
)
