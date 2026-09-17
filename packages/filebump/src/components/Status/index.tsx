import { Spacer, Txt, StyledBox, Spinner, ButtonAdd } from "ui-components"
import { formatFileSize } from "helpers"

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

export type UploadProgress = {
  fileIndex: number
  name: string
  size: number
  percent: number
  done: boolean
}

export const Sending = ({ uploads }: { uploads: UploadProgress[] }) => {
  if (uploads.length === 0) {
    return null
  }

  return (
    <>
      {uploads.map((upload) => (
        <div key={upload.fileIndex}>
          <StyledBox uc="solidBox" ucHover="solidBoxHover">
            <Txt uc="boxHeading">
              {upload.done ? "Sent" : "Sending"}
            </Txt>
            <Spacer uc="small" />
            <Txt uc="boxTxt">
              <div style={{ overflowWrap: "break-word" }}>{upload.name}</div>
            </Txt>
            <Spacer uc="small" />
            <Txt uc="boxTxt">{formatFileSize(String(upload.size))}</Txt>
            <Spacer uc="medium" />
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
                  width: `${Math.min(100, Math.max(0, upload.percent))}%`,
                  height: "100%",
                  borderRadius: 8,
                  backgroundColor: "#496EFF",
                  transition: "width 150ms linear",
                }}
              />
            </div>
            <Spacer uc="small" />
            <Txt uc="boxTxtInfo">{upload.percent}%</Txt>
            <Spacer uc="small" />
          </StyledBox>
          <Spacer uc="medium" />
        </div>
      ))}
    </>
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
