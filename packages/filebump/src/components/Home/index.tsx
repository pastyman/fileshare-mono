import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox } from "ui-components"
import { File, FileInfo } from "../File"

export const Home = ({
  onChange
}: {
  onChange: (files: FileList | null, fileInfo: FileInfo) => void
}) => {
  const router = useRouter()
  const handleNavClick = (url: string) => {
    router.push(url)
  }

  //used to clear the files on home return
  const [showFiles, setShowFiles] = useState(true)
  useEffect(() => {
    if (router.route === "/") {
      console.log("Clearing files")
      setShowFiles(false)
      setTimeout(() => {
        setShowFiles(true)
      }, 30)
    }
  },  [router.route ] )

  return (
    <Container uc="main">
      <StyledBox
        uc="solidBox"
        ucHover="solidBoxHover"
      >
        <Txt uc="boxHeading">Send</Txt>
        <Spacer uc="small" />
        <Txt uc="boxTxt">To send files, click the Choose files button</Txt>
        <Spacer uc="small" />
        {showFiles && <File onChange={onChange} />}
      </StyledBox>

      <Spacer uc="medium" />

      <StyledBox
        uc="solidBox"
        ucHover="solidBoxHover"
        onClick={() => {
          handleNavClick("/handshake-recieve")
        }}
      >
        <Txt uc="boxHeading">Recieve</Txt>
        <Spacer uc="small" />
        <Txt uc="boxTxt">Click here to recieve files</Txt>
        <Spacer uc="small" />
      </StyledBox>

      <Spacer uc="medium" />
    </Container>
  )
}