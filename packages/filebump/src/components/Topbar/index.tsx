import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox, Button } from "ui-components"
import IconButton from "@mui/material/IconButton"
import Home from "@mui/icons-material/Home"
export const Topbar = () => {
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
      <Container uc="topbar">
        <Container uc="topbarContent">
          <Container uc="topbarItem">
            ABOUT
          </Container>
          <Container uc="topbarItem">
            FEATURES
          </Container>
          <Container uc="topbarItem">
            PRIVACY
          </Container>
          <Container uc="topbarItem">
            DONATE
          </Container>
        </Container>
      </Container>
  
    </>
  )
}