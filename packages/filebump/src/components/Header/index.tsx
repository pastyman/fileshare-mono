import { Container, Spacer, Txt } from "ui-components"
import IconButton from "@mui/material/IconButton"
import Home from "@mui/icons-material/Home"

export const Header = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string) => {
    onNavigate(url)
  }

  return (
    <>
      <Spacer uc="medium" />
      <Container uc="header">
        <Container uc="headerContent">
          <Container uc="rowBox">
            <IconButton aria-label="home"
              onClick={() => {
                handleNavClick("/")
              }}>
              <Home />
            </IconButton>
            <Container uc="headerTitle">
              <Txt uc="headerTitle">FileBump</Txt>
            </Container>
          </Container>
        </Container>
      </Container>
    </>
  )
}