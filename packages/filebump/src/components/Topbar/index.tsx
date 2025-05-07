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
              handleNavClick("/")
            }}
          >
            HOME
          </Container>
          <Container uc="topbarItem"
            onClick={() => {
              handleNavClick("/about")
            }}
          >
            ABOUT
          </Container>
          <Container uc="topbarItem"
            onClick={() => {
              handleNavClick("/features")
            }}           
          >
            FEATURES
          </Container>
          <Container uc="topbarItemDonate"
            onClick={() => {
              handleNavClick("/donate")
            }}            
          >
            DONATE
          </Container>
          <Container uc="topbarItem"
            onClick={() => {
              handleNavClick("/privacy")
            }}          
          >
            PRIVACY
          </Container>
        </Container>
      </Container>

    </>
  )
}