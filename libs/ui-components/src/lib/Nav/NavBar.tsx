import React, { ReactNode } from "react"
import styled from "styled-components"

import AppBar from "@mui/material/AppBar"
import AccountCircle from "@mui/icons-material/AccountCircle"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import Menu from "@mui/material/Menu"

export function NavBar({
  name,
  logout
}: {
    name: string
  logout: () => void
}) {

  const [anchorEl, setAnchorEl] = React.useState<undefined | Element>()

  const handleMenu = (event: React.MouseEvent<Element, MouseEvent>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const handleLogOut = () => {
    handleClose()
    logout()
  }

  return (
    <>
      <AppBar elevation={0} color="transparent" position="static">
        <Toolbar className="lib-menu-toolbar">
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, display: "flex" }}
          >{name}</Typography>

            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <div
                  style={{ display: "flex", alignItems: "center", padding: 5 }}
                >
                  <AccountCircleStyled />
                </div>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogOut}>Sign out</MenuItem>
              </Menu>
            </div>
        </Toolbar>
      </AppBar>
    </>
  )
}

const AccountCircleStyled = styled(AccountCircle)`
  border-radius: 50%;
  box-shadow: 0px 0px 4px 1px white;
`