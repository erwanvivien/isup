import Head from "next/head";
import Uptime from "../components/Uptime";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Is your service up?</title>
        <meta
          name="description"
          content="Always keep an eye on your services. Fully configurable. Fully scalable."
        />
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="favicon.png" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta name="theme-color" content="var(--background)" />
        <meta property="og:title" content="IsUp" />
        <meta
          property="og:image"
          content="https://isup.xiaojiba.dev/logo_small.png"
        />
        <meta property="og:image:alt" content="IsUp" />
        <meta property="og:type" content="website" />
        <meta
          name="description"
          content="Always keep an eye on your services. Fully configurable. Fully scallable."
        />
        <meta
          property="og:description"
          content="Always keep an eye on your services. Fully configurable. Fully scallable."
        />
        <meta name="author" content="Erwan VIVIEN (github: erwanvivien)" />
        <meta name="keywords" content="uptime" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Is your service up?</h1>
        <Uptime />
      </main>
    </div>
  );
}
