import { useRouter } from "next/router"
import { Container, Spacer, Txt } from "ui-components"
import IconButton from "@mui/material/IconButton"
import Home from "@mui/icons-material/Home"
export const Header = () => {
  const router = useRouter()

  const handleNavClick = (url: string) => {
    router.push(url)
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