import CourseList from '../courses/CourseList'
import UserRegistration from '../users/UserRegistration'
import EnrollmentView from '../enrollments/EnrollmentView'
import styles from './MainContent.module.css'

interface MainContentProps {
  activeSection: 'cursos' | 'usuarios' | 'matriculas'
}

const MainContent = ({ activeSection }: MainContentProps) => {
  return (
    <div className={styles.content}>
      {activeSection === 'cursos' && <CourseList />}
      {activeSection === 'usuarios' && <UserRegistration />}
      {activeSection === 'matriculas' && <EnrollmentView />}
    </div>
  )
}

export default MainContent
