import { useState } from "react"
import { useRouter } from "next/router"
import { Container, Spacer, Txt, StyledBox, Spinner, Loading, ButtonSave } from "ui-components"
import { formatFileSize, isImage, isVideo, isDownload } from "helpers"

export const ViewFile = ({ file, index }: { file: any, index: number }) => {
  const [openFile, setOpenFile] = useState(false)
  const [downloadFile, setDownloadFile] = useState(false)

  const handleOpenFile = () => {
    setOpenFile(true)
  }

  const handleDownloadFile = () => {
    setDownloadFile(true)
  }

  return (
    <StyledBox
      uc="solidBox"
      ucHover="solidBoxHover"
      onClick={() => handleOpenFile()}
    >
      <Txt uc="boxHeading">{file.name}</Txt>
      <Spacer uc="small" />
      <Txt uc="boxTxt">{formatFileSize(file.size)}</Txt>
      <Spacer uc="medium" />
      {openFile && (
        <div>
          <Spacer uc="small" />
          {isImage(file.name) && (
            <img src={`/sfdownload/${index}/${file.size}/${file.name}`} width="320" />
          )}
          {isVideo(file.name) && (
            <video width="320" controls><source src={`/sfdownload/${index}/${file.size}/${file.name}`} type="video/webm" /></video>
          )}

          <Spacer uc="medium" />
          <ButtonSave
            text="Download file"
            sx={{ marginLeft: "auto" }}
            onClick={() => handleDownloadFile()}
          />

          {downloadFile && (
            <iframe src={`/sfdownload/${index}/${file.size}/${file.name}`} width="0" height="0" />
          )}
        </div>
      )}
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
      <Spacer uc="medium" />
      <Txt uc="boxTxt">Please don't navigate away from this page</Txt>
      <Spacer uc="medium" />
      <Txt uc="boxTxt">or the connection will be closed</Txt>
      <Spacer uc="small" />
    </StyledBox>
  )
}

export const Disconnected = () => {
  return (
    <StyledBox
      uc="solidBox"
      ucHover="solidBoxHover"
    >
      <Txt uc="boxHeading">You have been disconnected...</Txt>
      <Spacer uc="medium" />
      <Txt uc="boxTxt">You have been disconnected from your peer</Txt>
      <Spacer uc="medium" />
      <Txt uc="boxTxt">Please try again</Txt>
      <Spacer uc="small" />
    </StyledBox>
  )
}

