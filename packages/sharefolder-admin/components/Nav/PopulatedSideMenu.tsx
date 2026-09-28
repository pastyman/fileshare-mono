import React from "react"
import { SideMenu } from "ui-components"
import {
  Dashboard as OverviewIcon,
  CalendarMonth as DailyIcon,
  PrivacyTip as DataIcon,
} from "@mui/icons-material"

const navItems = [
  {
    label: "Overview",
    path: "/",
    icon: <OverviewIcon fontSize="small" />,
  },
  {
    label: "Daily stats",
    path: "/daily",
    icon: <DailyIcon fontSize="small" />,
  },
  {
    label: "What we collect",
    path: "/data",
    icon: <DataIcon fontSize="small" />,
  },
]

const PopulatedSideMenu = () => <SideMenu navItems={navItems} />

export default PopulatedSideMenu
