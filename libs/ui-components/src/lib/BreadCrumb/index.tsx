import * as React from "react"
import { styled } from "@mui/material/styles"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Chip from "@mui/material/Chip"

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  return {
    backgroundColor: "#0e164d",
    height: theme.spacing(4),
    color: "#fff",
    fontSize: "16px",
    marginBottom: "5px",
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: "#1d286f",
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: "#1d286f",
    },
  }
})

export function BreadCrumb({ path, handleClick}: { path: { name: string, url: string }[], handleClick: Function }) {
  return (
    <div role="presentation">
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={
          <NavigateNextIcon
            fontSize="small"
            sx={{
              marginLeft: "-5px",
              marginRight: "-5px",
              marginBottom: "5px",
            }}
          />
        }
      >
        {path.map((item, i) => (
          <StyledBreadcrumb
            key={i}
            //component="a"
            //href="#"
            label={item.name}
            onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
              event.preventDefault()
              handleClick(item.url)
            }}
          />
        ))}
      </Breadcrumbs>
    </div>
  )
}
