import { Link } from "react-router-dom";
import styles from "./Navigation.module.css";

export function Navigation() {
  return (
    <nav className={styles.navigation}>
      <Link to="/" className={styles.link}>
        Rewards
      </Link>
      <Link to="/history" className={styles.link}>
        History
      </Link>
    </nav>
  );
}
