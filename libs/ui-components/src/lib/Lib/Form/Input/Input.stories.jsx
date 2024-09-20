import React from "react"

import Input from "../Input"
import InputAdornment from "@mui/material/InputAdornment"

export default {
  title: "Form/Input",
  component: Input,
}

export const Standard = () => <Input placeholder="Placeholder text" />

export const WithInputAdornment = () => (
  <Input
    placeholder="Placeholder text"
    startAdornment={<InputAdornment position="start">£</InputAdornment>}
  />
)

export const WithSx = () => (
  <Input
    placeholder="Placeholder text"
    sx={{
      color: "green",
    }}
    color="warning"
  />
)
