import React from "react"
import styled from "styled-components"
import Box from "@mui/material/Box"
import { StyledBox, Spacer } from "ui-components"

export type FileInfo = {
  name: string
  size: number
}[]

export const File = ({
  onChange
}: {
  onChange: (files: FileList | null, fileInfo: FileInfo) => void
}) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    //construct file info
    const fileInfo = files ? Array.from(files).map((file) => {
      return {
        name: file.name,
        size: file.size
      }
    }) : []

    if (fileInfo.length > 0) {
      onChange(files, fileInfo)
    }
  }

  return (
    <StyledBox uc="solidBox" ucHover="solidBoxHover">
      <input type="file" name="files[]" id="home-files" className="filePicker" multiple={true} onChange={handleChange} />
    </StyledBox>
  )
}

const Heading = styled.div`
  font-size: 18;
  font-weight: bold;
`

