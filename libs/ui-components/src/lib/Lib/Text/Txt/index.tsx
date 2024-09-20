import React from "react"

export const Txt = ({
  uc,
  children,
}: {
  uc?: string
  children: React.ReactNode
}) => {
  return <span className={uc ? `lib-text-${uc}` : undefined}>{children}</span>
}
