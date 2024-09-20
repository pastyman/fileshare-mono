import React, { useState } from "react"
import {
  Select as SelectMUI,
  FormControl,
  MenuItem,
  styled,
  SelectChangeEvent,
} from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"

export function Select({
  sx = {},
  placeholder = "",
  value = undefined,
  onChange = () => {},
  children,
  ...rest
}: {
  sx?: object
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  children: React.ReactNode
}) {
  const [intValue, setIntValue] = useState(value ? value : "")

  const StyledIcon = styled(KeyboardArrowDownIcon)({
    "&.MuiSelect-icon": {
      borderLeft: "1px solid #eee",
    },
    "&.MuiSelect-iconOpen": {
      borderLeft: "0px",
      borderRight: "1px solid #eee",
    },
  })

  const handleChange = (e: SelectChangeEvent<string | number>) => {
    setIntValue(e.target.value.toString())

    if (onChange) {
      onChange(e.target.value.toString())
    }
  }

  return (
    <FormControl variant="outlined" fullWidth>
      <SelectMUI
        className="lib-form-select"
        displayEmpty
        IconComponent={StyledIcon}
        sx={sx}
        {...rest}
        value={intValue}
        onChange={handleChange}
      >
        <MenuItem value="" disabled>
          <span>{placeholder}</span>
        </MenuItem>
        {children}
      </SelectMUI>
    </FormControl>
  )
}
