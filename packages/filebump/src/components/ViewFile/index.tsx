import { useState } from "react"
import { Spacer, Txt, StyledBox, ButtonSave } from "ui-components"
import { formatFileSize, isImage, isVideo } from "helpers"

export type FileDownloadProgress = {
  percent: number
  done: boolean
}

export const ViewFile = ({
  file,
  index,
  downloadProgress,
  onDownloadStart,
}: {
  file: any
  index: number
  downloadProgress?: FileDownloadProgress | null
  onDownloadStart?: (fileIndex: number) => void
}) => {
  const [openFile, setOpenFile] = useState(false)
  const [downloadFile, setDownloadFile] = useState(false)

  const handleOpenFile = () => {
    setOpenFile(true)
  }

  const handleDownloadFile = () => {
    onDownloadStart?.(index)
    setDownloadFile(false)

    setTimeout(() => {
      setDownloadFile(true)
    }, 150)
  }

  const showDownloadProgress = Boolean(downloadProgress)

  return (
    <StyledBox
      uc="solidBox"
      ucHover="solidBoxHover"
      onClick={() => handleOpenFile()}
    >
      <Txt uc="boxHeading"><div style={{overflowWrap: "break-word"}}>{file.name}</div></Txt>
      <Spacer uc="small" />
      <Txt uc="boxTxt">{formatFileSize(file.size)}</Txt>
      <Spacer uc="medium" />
      {openFile && (
        <div>
          <Spacer uc="small" />
          {isImage(file.name) && (
            <img src={`/sfdownload/${index}/${file.size}/${file.name}`} style={{width: "100%", maxWidth: "max-content"}} />
          )}
          {isVideo(file.name) && (
            <video style={{width: "100%", aspectRatio: "4/3", backgroundColor: "black"}} controls><source src={`/sfdownload/${index}/${file.size}/${file.name}`} type="video/webm" /></video>
          )}

          <Spacer uc="medium" />
          <ButtonSave
            text="Download file"
            sx={{ marginLeft: "auto" }}
            onClick={handleDownloadFile}
          />

          {showDownloadProgress && downloadProgress && (
            <>
              <Spacer uc="medium" />
              <Txt uc="boxTxt">
                {downloadProgress.done ? "Downloaded" : "Downloading"}
              </Txt>
              <Spacer uc="small" />
              <div
                style={{
                  width: "100%",
                  height: 12,
                  borderRadius: 8,
                  backgroundColor: "#e6e6e6",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, downloadProgress.percent))}%`,
                    height: "100%",
                    borderRadius: 8,
                    backgroundColor: "#496EFF",
                    transition: "width 150ms linear",
                  }}
                />
              </div>
              <Spacer uc="small" />
              <Txt uc="boxTxtInfo">{downloadProgress.percent}%</Txt>
            </>
          )}

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
