'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
  ListItemIcon,
  Paper,
  Box,
  Button
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  KeyboardArrowDown as DownIcon
} from '@mui/icons-material';

export const SideMenu = ({navItems}: {navItems: any}) => {
  const router = useRouter();

  const [openSection, setOpenSection] = useState(null);

  // On first load, open the section that matches the current route
  useEffect(() => {
    const cleanedPath = router.asPath.split("?")[0]

    console.log("use effect cleanedPath", cleanedPath)

    for (const item of navItems) {
      if (cleanedPath === item.path) {
        setOpenSection(item.path);
        return;
      }
    }
  }, [router.pathname]);

  const handleToggle = (path: any) => {
    setOpenSection((prev) => (prev === path ? null : path));
  };

  const isActive = (path: any) => router.asPath.split("?")[0] === path;

  return (
    <List dense>
      {navItems.map((item: any) => {
        const isExpandable = !!item.children;
        const isExpanded = openSection === item.path;
        const isSubSelected = item.subSelected;
        const bgColor = item["bgcolor"] || 'transparent';
        const parentIsActive =
          isExpandable && item.children.some((c: any) => isActive(c.path));

        return (
          <React.Fragment key={item.path}>
            {isSubSelected ? (<>
              <Paper
                elevation={0}
                sx={{
                  m: 0,
                  p: 2,
                  backgroundColor: item.bgcolor ?? 'transparent',
                  borderRadius: 0,
                  //borderTop: '1px solid #ccc',
                  //borderBottom: `1px solid #ccc`,
                  width: '100%',
                }}
              >
                <Typography variant="subtitle2"><b>{item.title}</b></Typography>
                <Typography variant="subtitle2">{item.label}</Typography>

                {/* Button Row: View on left, Change on right */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  {/* View Button */}
                  {item.viewPath && (
                    <Link href={item.viewPath ?? '#'} passHref legacyBehavior>
                      <Button
                        component="a"
                        size="small"
                        variant="text"
                        sx={{
                          fontSize: '0.675rem',
                          minWidth: 'auto',
                          padding: '2px 6px',
                          lineHeight: 1.2,
                          textTransform: 'none',
                        }}
                      >
                        VIEW
                      </Button>
                    </Link>
                  )}

                  {/* Change Button */}
                  <Link href={item.path} passHref legacyBehavior>
                    <Button
                      component="a"
                      size="small"
                      variant="text"
                      sx={{
                        fontSize: '0.675rem',
                        minWidth: 'auto',
                        padding: '2px 6px',
                        lineHeight: 1.2,
                        textTransform: 'none',
                      }}
                    >
                      CHANGE
                    </Button>
                  </Link>
                </Box>
              </Paper>
              {item.downIcon && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <DownIcon fontSize="small" color="action" />
                </Box>
              )}

            </>
            ) : (
              <>
                {
                  isExpandable ? (
                    <>
                      <ListItemButton
                        onClick={() => handleToggle(item.path)}
                        sx={{
                          bgcolor: bgColor,
                          '&:hover': { bgcolor: bgColor },
                          fontWeight: parentIsActive ? 'bold' : 'normal',
                        }}
                      >
                        {item.icon && (
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            {item.icon}
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {item.label}
                            </Typography>
                          }
                        />
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding dense>
                          {item.children.map((child: any) => (
                            <Link key={child.label} href={child.path} passHref legacyBehavior>
                              <ListItemButton
                                component="a"
                                sx={{ pl: 4 }}
                                selected={isActive(child.path)}
                              >
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" noWrap>
                                      {child.label}
                                    </Typography>
                                  }
                                />
                              </ListItemButton>
                            </Link>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  ) : (
                    <Link href={item.path} passHref legacyBehavior>
                      <ListItemButton
                        component="a"
                        sx={{
                          bgcolor: bgColor,
                          '&:hover': { bgcolor: bgColor },
                        }}
                        selected={isActive(item.path)}
                      >
                        {item.icon && (
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            {item.icon}
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {item.label}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </Link>
                  )}
              </>
            )
            }

          </React.Fragment >
        );
      })}
    </List >
  );
};
