import { useState } from 'react'
import { Header, Footer, Navigation, MainContent } from './components/layout'
import './styles/globals.css'
import styles from './App.module.css'

function App() {
  const [activeSection, setActiveSection] = useState<
    'cursos' | 'usuarios' | 'matriculas'
  >('cursos')

  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <Navigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <MainContent activeSection={activeSection} />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
