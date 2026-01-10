import { Link } from "react-router-dom";
import { ThanxLogo } from "../branding/ThanxLogo";
import { PointsBalance } from "../user/PointsBalance";
import styles from "./Navigation.module.css";

export function Navigation() {
  return (
    <nav className={styles.navigation}>
      <Link to="/" className={styles.logoLink}>
        <ThanxLogo />
      </Link>
      <div className={styles.links}>
        <Link to="/" className={styles.link}>
          Rewards
        </Link>
        <Link to="/redemptions" className={styles.link}>
          Redemptions
        </Link>
      </div>
      <div className={styles.points}>
        <PointsBalance />
      </div>
    </nav>
  );
}
