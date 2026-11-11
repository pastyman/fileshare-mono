import React from "react"
import { Box } from "@mui/material"
import PopulatedSideMenu from "../Nav/PopulatedSideMenu"

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          width: 200,
          minHeight: "calc(100vh - 64px)",
          overflow: "clip",
          borderRight: "1px solid #ddd",
        }}
      >
        <PopulatedSideMenu />
      </Box>

      <Box sx={{ flexGrow: 1, p: 3, pt: 0.5 }}>{children}</Box>
    </Box>
  )
}
