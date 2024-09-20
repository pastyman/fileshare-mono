import { useState, useEffect } from "react"
import { NextRouter, useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox, Spinner, Loading, Input, ButtonAdd } from "ui-components"
import { getUUID } from "helpers"
import { serverConnectRecieve } from "rtc-client"

const Index = () => {
  const router = useRouter()

  const handleNavClick = (url: string, replace: boolean = false) => {
    if (replace){
      router.replace(url)
    }
    else {
      router.push(url)
    }
  }

  //state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [secret, setSecret] = useState("")

  //get uuid
  const clientId = getUUID()

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSecret(value)
  }

  //server funcs
  const onPeerId = (peerId: string | null) => {
    setIsSubmitting(false);

    if (peerId) {
      //navigate to recieve page
      handleNavClick(`/recieve?clientId=${clientId}&peerId=${peerId}`, true)
    }
    else {
      //navigate to error page
      handleNavClick(`/error`)
    }
  }

  //send to server
  const scr = serverConnectRecieve(onPeerId)

  const onSubmit = async () => {
    setIsSubmitting(true);
    //execute query
    scr.connectRecieve(clientId, secret)
  }

  return (
    <Container uc="main">
      <StyledBox
        uc="solidBox"
        ucHover="solidBoxHover"
      >
        <Txt uc="boxHeading">Enter 6 digit PIN</Txt>
        <Spacer uc="medium" />
        <Txt uc="boxTxt">Enter pin provided by sender to recieve your files</Txt>
        <Spacer uc="medium" />
        <Input sx={{}} type="text" value={secret} onChange={handleSecretChange} placeholder="6 digit pin" />
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
