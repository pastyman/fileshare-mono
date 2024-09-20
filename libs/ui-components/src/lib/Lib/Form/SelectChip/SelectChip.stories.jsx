import React from "react"

import SelectChip from "../SelectChip"
import MenuItem from "@mui/material/MenuItem"

export default {
  title: "Form/SelectChip",
  component: SelectChip,
}

export const Standard = () => (
  <SelectChip onChange={(value) => {}}>
    <MenuItem value="opt1">Option 1</MenuItem>
    <MenuItem value="opt2">Option 2</MenuItem>
  </SelectChip>
)

export const ValueSet = () => (
  <SelectChip onChange={(value) => {}} value="opt1">
    <MenuItem value="opt1">Option 1</MenuItem>
    <MenuItem value="opt2">Option 2</MenuItem>
  </SelectChip>
)

export const Small = () => (
  <SelectChip onChange={(value) => {}} size="small">
    <MenuItem value="opt1">Option 1</MenuItem>
    <MenuItem value="opt2">Option 2</MenuItem>
  </SelectChip>
)

export const WithSx = () => (
  <SelectChip
    onChange={(value) => {}}
    sx={{
      color: "#333",
      width: "100%",
      marginBottom: "10px",
    }}
    sxChecked={{
      width: "100%",
      marginBottom: "10px",
    }}
  >
    <MenuItem value="opt1">Option 1</MenuItem>
    <MenuItem value="opt2">Option 2</MenuItem>
  </SelectChip>
)
