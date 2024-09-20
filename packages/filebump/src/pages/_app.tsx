import { useState } from 'react';
import { AppProps } from 'next/app';
import { NextRouter, useRouter } from "next/router";
import Head from 'next/head';
import { FileInfo } from "../components/File";
import { Home } from "../components/Home";
import { Header } from "../components/Header";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const [fileInfo, setFileInfo] = useState<FileInfo>([])
  const handleFileChange = (files: FileList | null, fileInfo: FileInfo) => {
    setFileInfo(fileInfo)

    router.push("/handshake-send")
  }

  return (
    <>
      <Head>
        <link href="/css/fonts/ptsans/css.css" rel="stylesheet" />
        <link href="/css/global.css" rel="stylesheet" />
        <link href="/css/lib.css" rel="stylesheet" />
        <script src="/js/adapter-latest.js" />
      </Head>
      <Header />
      <div style={{ visibility: router.route === "/" ? "visible" : "hidden", height: "0px" }}>
        <Home onChange={handleFileChange} />
      </div>
      <main className="app">
        <Component fileInfo={fileInfo} {...pageProps} />
      </main>
    </>
  );
}

export default App;
