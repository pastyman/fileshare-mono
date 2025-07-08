import '../css/global.css'
import '../css/lib.css'
import '../css/fonts/ptsans/css.css'
import { useState } from 'react';
import { AppProps } from 'next/app';
import { useRouter } from "next/router";
import dynamic from "next/dynamic"
import Head from 'next/head';
import { FileInfo } from "../components/File";
import { Home } from "../components/Home";
import { Topbar } from "../components/Topbar";
import { Header } from "../components/Header";
import NoSleep from "nosleep.js"

function isActiveRoute(url: string) {
  if (url === "/handshake-send" || url === "/handshake-recieve" || url === "/send" || url === "/recieve") {
    return true
  }
  return false
}

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const noSleep = new NoSleep()
  const [activeShare, setActiveShare] = useState<boolean>(false)
  const [fileInfo, setFileInfo] = useState<FileInfo>([])

  const handleOnNavigate = (url: string, replace: boolean = false) => {
    if (isActiveRoute(url.split("?")[0])) {
      setActiveShare(true)
      noSleep.enable()
    }
    else {
      setTimeout(() => {
        setActiveShare(false)        
      }, 200);
      noSleep.disable()
    }
    
    console.log("navigating to ", url)
    if (replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  const handleFileChange = (files: FileList | null, fileInfo: FileInfo) => {
    setFileInfo(fileInfo)
    handleOnNavigate("/handshake-send")
  }

  if (!activeShare && isActiveRoute(router.route)) {
    //user has pressed refresh button on browser - redirect to home
    handleOnNavigate("/")
  }

  return (
    <>
      <Head>
        <link href="/css/fonts/ptsans/css.css" rel="stylesheet" />
        <script src="/js/adapter-latest.js" />
        <script defer data-domain="filebump.net" src="https://plausible.io/js/script.js"></script>
      </Head>
      <Topbar onNavigate={handleOnNavigate} />
      <Header onNavigate={handleOnNavigate} />
      <div style={{ visibility: router.route === "/" ? "visible" : "hidden", height: "0px" }}>
        <Home onFileChange={handleFileChange} onNavigate={handleOnNavigate} />
      </div>
      <main className="app">
        <Component onNavigate={handleOnNavigate} fileInfo={fileInfo} {...pageProps} />
      </main>
    </>
  );
}

// export default App
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
