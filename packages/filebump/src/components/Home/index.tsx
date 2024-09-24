import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox } from "ui-components"
import { File, FileInfo } from "../File"

export const Home = ({
  onFileChange,
  onRecieve,
  onHome
}: {
  onFileChange: (files: FileList | null, fileInfo: FileInfo) => void
  onRecieve: () => void
  onHome: () => void
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
        onHome()
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
        {showFiles && <File onChange={onFileChange} />}
      </StyledBox>

      <Spacer uc="medium" />

      <StyledBox
        uc="solidBox"
        ucHover="solidBoxHover"
        onClick={() => onRecieve()}
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