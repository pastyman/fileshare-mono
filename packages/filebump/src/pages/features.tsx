import { Container, Spacer, Txt, StyledBox, ButtonAdd } from "ui-components"

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
        <Txt uc="boxHeading">Features</Txt>
        <Spacer uc="small" />
        <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
          <Txt uc="boxTxtInfo">
            <p>Filebump can stream videos to the recieving device.</p>

            <img src="/img/video-stream.png" alt="video stream" style={{ width: "100%", maxWidth: "300px" }} />

            <p>You can watch videos streamed from your phone on your smart TV or any other internet enabled device instantly without downloading.</p>

            <hr />

            <p>Filebump can handle multiple file transfers.</p>

            <img src="/img/multiple-file-download.png" alt="multiple file download" style={{ width: "100%", maxWidth: "300px" }} />            
          
            <hr />

            <p>Filebump uses multiplexed RTC streams and adaptive file chunking to achieve unparalleled download speeds.</p>
          
            <img src="/img/super-fast-download-speed.png" alt="multiple file download" style={{ width: "100%", maxWidth: "300px" }} /> 

          </Txt>
        </div>
        <Spacer uc="medium" />
      </StyledBox>
    </Container>
  );
}

export default Index;
