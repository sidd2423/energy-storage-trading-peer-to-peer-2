import { useState, useEffect } from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import styles from "../styles/Home.module.css";
import batteries from "./api/batteries";
import PtoPInstructions from "./components/PtoPInstructions";
import Header from "./components/Header";

function Home({ Web3Contracts }) {
  const year = new Date().getFullYear();

  return (
    <div className={styles.container}>
      <Head>
        <title>P2P Energy Trading - Siddhraj</title>
        <meta name="P2P Energy Trading" content="Virtual Power Plant" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={styles.main}>
        <Container fluid>
          <PtoPInstructions />
        </Container>
      </main>
      <footer className={styles.footer}>&#169; Siddhraj {year}</footer>
    </div>
  );
}

export default Home;