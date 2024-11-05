import '../css/global.css'
import '../css/lib.css'
import '../css/fonts/ptsans/css.css'
import { useState } from 'react';
import { AppProps } from 'next/app';
import { NextRouter, useRouter } from "next/router";
import dynamic from "next/dynamic"
import Head from 'next/head';
import { FileInfo } from "../components/File";
import { Home } from "../components/Home";
import { Header } from "../components/Header";
import NoSleep from "nosleep.js"

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const noSleep = new NoSleep()

  const [fileInfo, setFileInfo] = useState<FileInfo>([])
  const handleFileChange = (files: FileList | null, fileInfo: FileInfo) => {
    setFileInfo(fileInfo)
    noSleep.enable()
    router.push("/handshake-send")
  }

  const handleOnRecieve = () => {
    noSleep.enable()
    router.push("/handshake-recieve")
  }

  const handleOnHome = () => {
    console.log("disabling nosleep")
    noSleep.disable()
  }

  return (
    <>
      <Head>
        <link href="/css/fonts/ptsans/css.css" rel="stylesheet" />
        <script src="/js/adapter-latest.js" />
      </Head>
      <Header />
        <div style={{ visibility: router.route === "/" ? "visible" : "hidden", height: "0px" }}>
          <Home onFileChange={handleFileChange} onRecieve={handleOnRecieve} onHome={handleOnHome} />
        </div>
      <main className="app">
        <Component fileInfo={fileInfo} {...pageProps} />
      </main>
    </>
  );
}

// export default App
export default dynamic(() => Promise.resolve(App), {
  ssr: false,
})
