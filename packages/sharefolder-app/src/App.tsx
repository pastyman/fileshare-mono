import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { styled, Theme, CSSObject, ThemeProvider } from "@mui/material/styles"

import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import HomePage from "./pages/Home";
import AboutPage from "./pages/About";
import SettingsPage from "./pages/Settings";
import UsersPage from "./pages/Users";
import StatsPage from "./pages/Stats";
import ConnectionStatus from "./components/ConnectionStatus";
import { ShareFolderMark } from "./components/ShareFolderMark";
import { HashRouter, Navigate } from "react-router-dom";
import { createAppTheme } from "./theme";
import "./theme/types"; // Import theme type declarations

const drawerWidth = 220;

interface DrawerProps {
  open?: boolean;
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<MuiAppBarProps & { open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  })
);

function NavList({ open }: { open: boolean }) {
  const location = useLocation();
  const items = [
    { to: "/", label: "Folders", icon: <HomeIcon /> },
    { to: "/users", label: "Users", icon: <PeopleIcon /> },
    { to: "/stats", label: "Stats", icon: <BarChartIcon /> },
    { to: "/about", label: "About", icon: <InfoIcon /> },
    { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <List>
      {items.map((item) => {
        const selected = location.pathname === item.to;
        return (
          <ListItem key={item.to} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={selected}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}



function Shell() {
  const [open, setOpen] = React.useState(true);
  const [userManuallyToggled, setUserManuallyToggled] = React.useState(false);
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  
  const toggle = () => {
    setOpen((o) => !o);
    setUserManuallyToggled(true);
  };

  // Theme toggle function
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  // Load saved theme preference
  React.useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark';
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  // Auto-collapse menu when window gets too small
  React.useEffect(() => {
    const handleResize = () => {
      const breakpoint = 768; // 768px breakpoint (tablet/mobile)
      
      if (window.innerWidth < breakpoint) {
        // Small screen - auto-collapse unless user manually expanded
        if (open && !userManuallyToggled) {
          setOpen(false);
        }
      } else {
        // Large screen - auto-expand unless user manually collapsed
        if (!open && !userManuallyToggled) {
          setOpen(true);
        }
        // Don't reset manual toggle flag - let user keep their preference
      }
    };

    // Set initial state based on current window size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [open, userManuallyToggled]);

  return (
    <ThemeProvider theme={createAppTheme(mode)}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggle}
              edge="start"
              sx={{ marginRight: 2 }}
            >
              {open ? <MenuIcon /> : <ChevronRightIcon />}
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1 }}>
              <ShareFolderMark size={28} />
              <Typography variant="h6" noWrap component="div" fontWeight={700}>
                ShareFolder
              </Typography>
            </Box>
            <IconButton
              color="inherit"
              aria-label="toggle theme"
              onClick={toggleTheme}
              sx={{ ml: 1 }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <DrawerStyled variant="permanent" open={open}>
          <Toolbar />
          <Divider />
          <NavList open={open} />

          {/* Separating line - extends to full width */}
          <Box sx={{
            position: 'absolute',
            bottom: 8,
            width: '100%',
            zIndex: 9999,
          }}>
            <Divider />
            <Box sx={{
              pl: 3, pr: 3
            }}>
              <ConnectionStatus open={open} />
            </Box>
          </Box>
          {/* Connection Status Container - Pinned to bottom left corner */}
        </DrawerStyled>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  // HashRouter is often friendlier inside Electron; BrowserRouter also works
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
