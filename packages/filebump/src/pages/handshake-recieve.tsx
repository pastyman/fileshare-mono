import { useState } from "react"
import { Container, Spacer, Txt, StyledBox, Input, ButtonAdd, } from "ui-components"
import Alert from "@mui/material/Alert"
import { getUUID } from "helpers"
import { serverConnectRecieve } from "rtc-client"

const Index = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }

  // State
  const [errorCode, setErrorCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [secret, setSecret] = useState("")

  // Get UUID
  const clientId = getUUID()

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSecret(value)
    setErrorCode("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit()
    }
  }

  // Server functions
  const onPeerId = (peerId: string) => {
    setIsSubmitting(false)
    // Navigate to receive page
    handleNavClick(`/recieve?clientId=${clientId}&peerId=${peerId}`, true)
  }
  const onError = (errorCode: "incorrectPin" | "serverError") => {
    setIsSubmitting(false)
    setErrorCode(errorCode)
  }

  // Send to server
  const scr = serverConnectRecieve(onPeerId, onError)

  const onSubmit = async () => {
    setIsSubmitting(true)
    setErrorCode("")
    // Execute query
    scr.connectRecieve(clientId, secret)
  }

  return (
    <Container uc="main">
      <StyledBox uc="solidBox" ucHover="solidBoxHover">
        <Txt uc="boxHeading">Enter 6 digit PIN</Txt>
        <Spacer uc="medium" />
        <Txt uc="boxTxt">Enter pin provided by sender to receive your files</Txt>
        <Spacer uc="medium" />
        {errorCode === "incorrectPin" && (
          <>
            <Alert severity="warning">
              Incorrect pin, please try again
            </Alert>
            <Spacer uc="medium" />
          </>
        )}
        {errorCode === "serverError" && (
          <>
            <Alert severity="error">
              Error communicating with server, please try again
            </Alert>
            <Spacer uc="medium" />
          </>
        )}
        <Input
          sx={{}}
          type="number"
          value={secret}
          onChange={handleSecretChange}
          onKeyDown={handleKeyDown}
          placeholder="6 digit pin"
        />
        <Spacer uc="medium" />
        <Container uc="rowBox">
          <ButtonAdd
            disabled={isSubmitting}
            text="Submit"
            sx={{ marginLeft: "auto" }}
            onClick={onSubmit}
          />
          <Spacer uc="medium" />
        </Container>
      </StyledBox>
      <Spacer uc="medium" />
    </Container>
  )
}

export default Index
