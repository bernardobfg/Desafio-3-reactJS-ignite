import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={styles.container}>
      <div>
        <img src="/Logo.svg" alt="logo" />
      </div>
    </header>
  );
}
