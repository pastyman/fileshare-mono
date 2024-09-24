import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox, Button } from "ui-components"
import IconButton from "@mui/material/IconButton"
import Home from "@mui/icons-material/Home"
export const Header = () => {
  const router = useRouter()

  const handleNavClick = (url: string) => {
    router.push(url)
  }

  const [isHome, setIsHome] = useState(true)
  useEffect(() => {
    setIsHome(router.route === "/")
  }, [router.route])

  return (
    <>
      <Spacer uc="medium" />
      <Container uc="header">
        <Container uc="headerContent">

          <Container uc="rowBox">
            <IconButton aria-label="delete">
              <Home
                onClick={() => {
                  handleNavClick("/")
                }}
              />
            </IconButton>
            <Container uc="headerTitle">
              <Txt uc="headerTitle">FileBump</Txt>
            </Container>
            {/* <Container uc="headerVideo">
              {isHome ? (
                <></>
              ) : (
                <video width="100px" autoPlay muted loop style={{ borderRadius: "5px" }}>
                  <source src="/video.mp4" type="video/mp4" />
                </video>
              )}
            </Container> */}
          </Container>


        </Container>
      </Container>
    </>
  )
}