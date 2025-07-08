import { useState, useEffect } from "react"
import { Container, Spacer, Txt, StyledBox, Spinner, ButtonAdd } from "ui-components"
import { getUUID } from "helpers"
import { serverConnectSend } from "rtc-client"
import CountdownTimer from "../components/CountdownTimer"

const Index = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }

  //state
  const [isLoading, setIsLoading] = useState(true)
  const [secret, setSecret] = useState(null as string | null)

  //get uuid
  const clientId = getUUID()

  //server funcs
  const onPeerId = (peerId: string | null) => {
    if (peerId) {
      //navigate to send page
      handleNavClick(`/send?clientId=${clientId}&peerId=${peerId}`, true)
    }
    else {
      //navigate to error page
      handleNavClick(`/error`)
    }
  }
  const onSecret = (secret: string | null) => {
    if (secret) {
      setSecret(secret)
      setIsLoading(false)
    }
  }
  const onTimeout = () => {
    //TODO, show user the 5 mins is up
    handleNavClick(`/timeout?reason=timeout-handshake-send`, true)
  }

  //send to server
  const scs = serverConnectSend(onPeerId, onSecret, onTimeout)
  useEffect(() => {
    scs.connectSend(clientId)
    return () => scs.close()
  }, []);

  return (
    <Container uc="main">

      {isLoading && (
        <StyledBox
          uc="solidBox"
          ucHover="solidBoxHover"
        >
          <Txt uc="boxHeading">Please wait...</Txt>
          <Spacer uc="medium" />
          <Spinner />
          <Spacer uc="small" />
        </StyledBox>
      )}
      {!isLoading && (
        <StyledBox
          uc="solidBox"
          ucHover="solidBoxHover"
        >
          <Txt uc="boxHeading">On the recieving device...</Txt>
          <Spacer uc="medium" />
          <Txt uc="boxTxt">Please follow these steps:</Txt>
          <Spacer uc="small" />
          <Txt uc="boxTxt">Visit filebump.net</Txt>
          <Spacer uc="small" />
          <Txt uc="boxTxt">Click 'Recieve files'</Txt>
          <Spacer uc="small" />
          <Txt uc="boxTxt">Enter the following 6 digit PIN:</Txt>
          <Spacer uc="small" />
          <CountdownTimer
            initialTime={300}
            activeMessage={(time) => (
              <>
                <Txt uc="boxTxtSecret">{secret}</Txt>
                <Spacer uc="small" />
                <Txt uc="boxTxt">
                  This code  expires in: <b>{time}</b>
                </Txt>
              </>
            )}
            expiredMessage={
              <>
                <Txt uc="boxTxtSecret">
                  Your code has expired. Please try again.
                </Txt>
                <Spacer uc="small" />
                <ButtonAdd
                  text="Try again"
                  sx={{ marginLeft: "auto" }}
                  onClick={() => handleNavClick("/")}
                />
              </>
            }
          />
          <Spacer uc="small" />
        </StyledBox>
      )}

      <Spacer uc="medium" />
    </Container>
  )
}

export default Index
