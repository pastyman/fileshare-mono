import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox, Spinner, Loading, ButtonAdd } from "ui-components"
import IconButton from "@mui/material/IconButton"
import Home from "@mui/icons-material/Home"

export const Connecting = () => {
  return (
  <StyledBox
    uc="solidBox"
    ucHover="solidBoxHover"
  >
    <Txt uc="boxHeading">Connecting...</Txt>
    <Spacer uc="medium" />
    <Spinner />
    <Spacer uc="small" />
  </StyledBox>
  )
}

export const Connected = () => {

  return (
  <StyledBox
    uc="solidBox"
    ucHover="solidBoxHover"
  >
    <Txt uc="boxHeading">You are connected to your peer</Txt>
    <Spacer uc="small" />
    <Txt uc="boxTxt">Please don't navigate away from this page</Txt>
    <Spacer uc="small" />
    <Txt uc="boxTxt">or the connection will be closed</Txt>
    <Spacer uc="small" />
  </StyledBox>
  )
}

export const Disconnected = ({handleNavClick}: {handleNavClick : (usr: string) => void}) => {
  return (
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
  )
}

