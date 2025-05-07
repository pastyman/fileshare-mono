import { Container, Spacer, Txt, StyledBox, ButtonAdd } from "ui-components"
import { Donate } from "../components/Donate"

const Index = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }

  return (
    <Container uc="main">
      <StyledBox
        uc="solidBox"
        ucHover="solidBoxHover"
      >
        <Txt uc="boxHeading">Donate</Txt>
        <Spacer uc="small" />
        <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
          <Txt uc="boxTxtInfo">
            <p>Filebump is a free file transfer platform giving users the ability to initiate p2p file transfers without a middleman. The servers to run the platform cost money. I provide it to the world for free with no adverts.</p>

            <p>Please click the 'buy me a coffee' button below to donate!</p>
            
            <Donate />
          </Txt>
        </div>
        <Spacer uc="medium" />
      </StyledBox>
    </Container>
  );
}

export default Index;
