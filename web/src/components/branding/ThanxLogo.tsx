import thanxLogo from "./thanx-logo.png";
import styles from "./ThanxLogo.module.css";

export function ThanxLogo() {
  return (
    <div className={styles.logo}>
      <img src={thanxLogo} alt="Thanx" className={styles.image} />
    </div>
  );
}
