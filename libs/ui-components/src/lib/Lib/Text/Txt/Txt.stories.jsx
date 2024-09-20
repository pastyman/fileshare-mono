import React from "react"

import Txt from "../Txt"

export default {
  title: "Text/Txt",
  component: Txt,
}

export const txtH1 = () => (
  <Txt uc="h1">
    I am a h1 Txt my style matches the uc (use class) name from the theme file
  </Txt>
)

export const txtH2 = () => (
  <Txt uc="h2">
    I am a h2 Txt my style matches the uc (use class) name from the theme file
  </Txt>
)

export const txtMedium = () => (
  <Txt uc="medium">
    I am a medium Txt my style matches the uc (use class) name from the theme
    file
  </Txt>
)
