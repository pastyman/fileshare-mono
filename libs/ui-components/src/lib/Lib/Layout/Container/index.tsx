import React from "react"

export const Container = ({
  uc,
  children,
  onClick,
  ...rest
}: {
  uc?: string
  children: React.ReactNode
  onClick?: () => void
}) => {
  return (
    <div
      className={uc ? `lib-container-${uc}` : undefined}
      {...rest}
      onClick={() => onClick && onClick()}
    >
      {children}
    </div>
  )
}
