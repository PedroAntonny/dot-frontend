import { BookOpen, UserPlus, GraduationCap } from 'lucide-react'
import styles from './Navigation.module.css'

interface NavigationProps {
  activeSection: 'cursos' | 'usuarios' | 'matriculas'
  onSectionChange: (section: 'cursos' | 'usuarios' | 'matriculas') => void
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const navItems = [
    {
      id: 'cursos' as const,
      label: 'Cursos e Turmas',
      icon: BookOpen,
    },
    {
      id: 'usuarios' as const,
      label: 'Cadastro de Usuário',
      icon: UserPlus,
    },
    {
      id: 'matriculas' as const,
      label: 'Visualizar Matrículas',
      icon: GraduationCap,
    },
  ]

  return (
    <div className={styles.navigation}>
      <ul className={styles.navTabs}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} className={styles.navTab}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={`${styles.navButton} ${
                  activeSection === item.id ? styles.active : ''
                }`}
              >
                <Icon className={styles.navIcon} />
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Navigation
