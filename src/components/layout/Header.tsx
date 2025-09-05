import { BookOpen } from 'lucide-react'
import styles from './Header.module.css'

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <BookOpen />
            </div>
            <div className={styles.logoText}>
              <h1>Sistema de Cursos</h1>
              <p>Gestão de cursos e matrículas</p>
            </div>
          </div>

          <div className={styles.headerSpacer}></div>
        </div>
      </div>
    </header>
  )
}

export default Header
