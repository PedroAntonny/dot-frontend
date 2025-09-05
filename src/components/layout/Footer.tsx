import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p>
            © 2025 Sistema de Gestão de Cursos. Desenvolvido para o desafio Dot
            Digital Group.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
