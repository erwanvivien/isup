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
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Is your service up?</h1>
        <Uptime />
      </main>
    </div>
  );
}
