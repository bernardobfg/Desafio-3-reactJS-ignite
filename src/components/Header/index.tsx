import { ReactElement } from 'react';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={styles.container}>
      <div>
        <Link href="/">
          <img src="/Logo.svg" alt="logo" />
        </Link>
      </div>
    </header>
  );
}
