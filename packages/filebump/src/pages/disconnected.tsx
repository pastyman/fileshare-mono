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
        <Txt uc="boxHeading">You have been disconnected...</Txt>
        <Spacer uc="small" />
        <Txt uc="boxTxt">You have been disconnected from your peer</Txt>
        <Spacer uc="small" />
        <Txt uc="boxTxt">Please try again</Txt>
        <Spacer uc="medium" />
        <ButtonAdd
          text="Try again"
          sx={{ marginLeft: "auto" }}
          onClick={() => handleNavClick("/")}
        />
      </StyledBox>
    </Container>
  );
}

export default Index;
