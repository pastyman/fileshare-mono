import React from "react"

import Button from "../Button"

export default {
  title: "Form/Button",
  component: Button,
}

export const Standard = () => <Button>Click me</Button>

export const Outlined = () => <Button variant="outlined">Click me</Button>

export const WithSx = () => (
  <Button
    sx={{
      backgroundColor: "lightblue",
      color: "red",
    }}
  >
    Click me
  </Button>
)
