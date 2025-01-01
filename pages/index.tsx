import type { NextPage } from 'next';
import Head from 'next/head';
import { WorldGenerator } from '../components/WorldGenerator';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>World Generator</title>
        <meta name="description" content="2D world generator using Perlin noise" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Perlin Noise World Generator
        </h1>

        <div className={styles.worldContainer}>
          <WorldGenerator />
        </div>
      </main>
    </div>
  );
};

export default Home; 