import { ReactNode, useEffect } from "react"
import { Sidebar, useProSidebar } from "react-pro-sidebar"

export const SideMenu = ({
  showSideBar,
  collapsed,
  children,
}: {
  showSideBar: boolean
  collapsed: boolean
  children: ReactNode
}) => {
  const { collapseSidebar } = useProSidebar()

  useEffect(() => {
    collapseSidebar(collapsed)
  }, [collapsed])

  return (
    <>
      {showSideBar && (
        <Sidebar
          className="lib-menu-sidebar"
          backgroundColor={"rgb(0, 0, 0, 0)"}
          rootStyles={{
            minHeight: "100%",
          }}
          transitionDuration={30}
          breakPoint={showSideBar ? undefined : "always"}
        >
          {children}
        </Sidebar>
      )}
    </>
  )
}
