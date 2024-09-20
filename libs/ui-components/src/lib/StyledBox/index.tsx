import React, { useState } from "react"
import { Container } from "../Lib/Layout/Container"

export const StyledBox = ({
  uc,
  ucHover,
  onClick = () => {},
  children,
}: {
  uc: string
  ucHover: string
  onClick?: () => void
  children: React.ReactNode
}) => {
  const [dynStyle, setDynStyle] = useState(uc)

  const handleMouseOver = () => {
    setDynStyle(ucHover)
  }

  const handleMouseOut = () => {
    setDynStyle(uc)
  }

  return (
    <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <Container uc={dynStyle} onClick={onClick}>
        {children}
      </Container>
    </div>
  )
}
