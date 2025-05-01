import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox } from "ui-components"
import { File, FileInfo } from "../File"

export const Home = ({
  onFileChange,
  onNavigate
}: {
  onFileChange: (files: FileList | null, fileInfo: FileInfo) => void
  onNavigate: any
}) => {
  const router = useRouter()
  const handleNavClick = (url: string) => {
    onNavigate(url, true)
  }

  //used to clear the files on home return
  const [showFiles, setShowFiles] = useState(true)
  useEffect(() => {
    if (router.route === "/") {
      console.log("Clearing files")
      setShowFiles(false)
      setTimeout(() => {
        setShowFiles(true)
        handleNavClick("/")
      }, 30)
    }
  }, [router.route])

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
        <div style={{ minHeight: "85px" }}>
          {showFiles && <File onChange={onFileChange} />}
        </div>
      </StyledBox>

      <Spacer uc="medium" />

      <StyledBox
        uc="solidBoxLink"
        ucHover="solidBoxLinkHover"
        onClick={() => handleNavClick("/handshake-recieve")}
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