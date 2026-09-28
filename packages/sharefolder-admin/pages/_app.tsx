import { AppProps } from "next/app"
import Head from "next/head"
import dynamic from "next/dynamic"
import { useRouter } from "next/router"
import { NavBar } from "ui-components"
import { Layout } from "../components/Layout"

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isLogin = router.pathname === "/login"

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" })
    router.replace("/login")
  }

  return (
    <>
      <Head>
        <title>ShareFolder admin</title>
        <link href="/css/fonts/ptsans/css.css" rel="stylesheet" />
        <link href="/css/global.css" rel="stylesheet" />
        <link href="/css/lib.css" rel="stylesheet" />
      </Head>

      {router.isReady &&
        (isLogin ? (
          <Component {...pageProps} />
        ) : (
          <>
            <NavBar name="sharefolder:admin" logout={handleLogout} />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </>
        ))}
    </>
  )
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
