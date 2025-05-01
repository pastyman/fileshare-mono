import { Container, Spacer, Txt, StyledBox, Button } from "ui-components"
export const Topbar = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string) => {
    onNavigate(url)
  }

  return (
    <>
      <Container uc="topbar">
        <Container uc="topbarContent">
          <Container uc="topbarItem"
            onClick={() => {
              handleNavClick("/about")
            }}
          >
            ABOUT
          </Container>
          <Container uc="topbarItem">
            FEATURES
          </Container>
          <Container uc="topbarItem"
            onClick={() => {
              handleNavClick("/privacy")
            }}          
          >
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