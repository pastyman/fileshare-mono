import React, { useState } from "react"
import CheckIcon from "@mui/icons-material/Check"
import CircleIcon from "@mui/icons-material/CircleOutlined"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"

type SelectChipChildProps = {
  value: string | number
  children?: React.ReactNode
}

type SelectChipChild = React.ReactElement<SelectChipChildProps>

export const SelectChip = ({
  sx = {},
  sxChecked = {},
  children,
  value = undefined,
  onChange = () => {},
  size = "medium",
}: {
  sx?: object
  sxChecked?: object
  placeholder?: string
  children: SelectChipChild[]
  value?: string | number | undefined
  onChange?: (value: string | number) => void
  size?: "small" | "medium"
}) => {
  const [intValue, setIntValue] = useState(value)

  const handleChange = (child: SelectChipChild) => {
    setIntValue(child.props.value)

    if (onChange) {
      onChange(child.props.value)
    }
  }

  return (
    <>
      {children.map((child, index) => {
        if (child.type === MenuItem) {
          return (
            <span key={index} style={{ marginRight: 10, marginBottom: 10 }}>
              {intValue === child.props.value && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    handleChange(child)
                  }}
                  className={
                    size === "small" ? "lib-form-chip-small" : "lib-form-chip"
                  }
                  sx={{
                    ...sxChecked,
                  }}
                  size={size ? size : "medium"}
                >
                  {child.props.children}
                </Button>
              )}
              {intValue !== child.props.value && (
                <Button
                  variant="outlined"
                  startIcon={<CircleIcon />}
                  onClick={() => {
                    handleChange(child)
                  }}
                  className={
                    size === "small" ? "lib-form-chip-small" : "lib-form-chip"
                  }
                  sx={{
                    backgroundColor: "white",
                    ...sx,
                  }}
                  size={size ? size : "medium"}
                >
                  {child.props.children}
                </Button>
              )}
            </span>
          )
        }
      })}
    </>
  )
}
