import { useRouter } from 'next/router';
 import styles from '../../styles/HeaderFooter.module.css';

function Header() {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <a href="/"><img src="/logo.png" alt="Logo" className={styles.logo} /></a>
        <h1 className={styles.siteTitle}>Peer-to-Peer Energy Trading</h1>
        
      </div>

      {isHomePage && (
        <>
          <div className={styles.fullWidthDivider}></div>
          <h1 className={styles.siteDescription}>Empowering Decentralized Energy Solutions</h1>
        </>
      )}
    </header>
  );
}

export default Header;