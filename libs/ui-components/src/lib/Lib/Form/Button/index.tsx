import { ReactNode } from "react"
import MuiButton from "@mui/material/Button"

export const Button = ({ ...rest }) => {
  const { children, variant, sx, onClick, startIcon, color, ...theRest } = rest

  return (
    <MuiButton
      className="lib-form-button"
      sx={sx}
      variant={variant ? variant : "contained"}
      onClick={() => onClick && onClick()}
      color={color}
      startIcon={startIcon}
      {...theRest}
    >
      {children}
    </MuiButton>
  )
}
