import React, { ReactNode } from "react"
import styled from "styled-components"
import AppBar from "@mui/material/AppBar"
import AccountCircle from "@mui/icons-material/AccountCircle"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Menu from "@mui/material/Menu"

import Drawer from "@mui/material/Drawer"
import { SideMenu } from "./SideMenu"
import { ProSidebarProvider } from "react-pro-sidebar"
import { useRouter } from "next/router"

export function NavBar({
  logIn,
  children,
}: {
  logIn: () => void
  children: ReactNode
}) {

  const [anchorEl, setAnchorEl] = React.useState<undefined | Element>()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleMenu = (event: React.MouseEvent<Element, MouseEvent>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const router = useRouter()

  return (
    <>
      <AppBar elevation={0} color="transparent" position="static">
        <Toolbar className="lib-menu-toolbar">
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, ml: "-11px" }}
            onClick={() => {
              toggleDrawer()
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, display: "flex" }}
          >
            <img
              src="logo.png"
              alt="logo"
              width="120px"
            />
          </Typography>
        </Toolbar>
      </AppBar>
      <ProSidebarProvider>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => {
            toggleDrawer()
          }}
        >
          <SideMenu showSideBar={true} collapsed={false}>
            {children}
          </SideMenu>
        </Drawer>
      </ProSidebarProvider>
    </>
  )
}

const AccountCircleStyled = styled(AccountCircle)`
  border-radius: 50%;
  box-shadow: 0px 0px 4px 1px white;
`
