import '../css/global.css'
import '../css/lib.css'
import '../css/fonts/ptsans/css.css'
import { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { NextRouter, useRouter } from "next/router";
import dynamic from "next/dynamic"
import Head from 'next/head';
import { FileInfo } from "../components/File";
import { Home } from "../components/Home";
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
  const handleFileChange = (files: FileList | null, fileInfo: FileInfo) => {
    setFileInfo(fileInfo)
    noSleep.enable()
    router.push("/handshake-send")
    setActiveShare(true)
  }

  if (!activeShare && isActiveRoute(router.route)) {
    //user has pressed refresh button on browser - redirect to home
    router.push("/")
  }

  const handleOnNavigate = (url: string, replace: boolean = false) => {
    if (isActiveRoute(url.split("?")[0])) {
      setActiveShare(true)
      noSleep.enable()
    }
    else {
      setActiveShare(false)
      noSleep.disable()
    }
    
    console.log("navigating to ", url)
    if (replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  return (
    <>
      <Head>
        <link href="/css/fonts/ptsans/css.css" rel="stylesheet" />
        <script src="/js/adapter-latest.js" />
      </Head>
      <Header />
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
