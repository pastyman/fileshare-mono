import React from "react"

import Select from "../Select"
import MenuItem from "@mui/material/MenuItem"

export default {
  title: "Form/Select",
  component: Select,
}

export const Standard = () => (
  <Select id="id" onChange={(value) => {}} value="" placeholder="Select option">
    <MenuItem value="opt1">Option 1</MenuItem>
    <MenuItem value="opt2">Option 2</MenuItem>
  </Select>
)

export const WithSx = () => (
  <Select
    id="id"
    onChange={(value) => {}}
    placeholder="Select option"
    sx={{
      color: "green",
    }}
  >
    <MenuItem value="opt1">Option 1</MenuItem>
    <MenuItem value="opt2">Option 2</MenuItem>
  </Select>
)
