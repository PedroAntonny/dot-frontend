import { memo, useState, useRef, useEffect } from 'react'
import { Calendar, Users, BookOpen } from 'lucide-react'
import { CourseWithClasses, ClassResponseDto } from '@/types/api'
import { formatDate } from '@/lib/utils'
import styles from './CourseCard.module.css'

interface CourseCardProps {
  course: CourseWithClasses
  onEnroll: (classId: string) => void
}

const CourseCard = memo(({ course, onEnroll }: CourseCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isTextTruncated, setIsTextTruncated] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current
        const isTruncated = element.scrollHeight > element.clientHeight
        setIsTextTruncated(isTruncated)
      }
    }

    const timeoutId = setTimeout(checkTruncation, 0)
    window.addEventListener('resize', checkTruncation)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkTruncation)
    }
  }, [course.description, showFullDescription])

  const getThemeLabel = (theme: string) => {
    const themes: Record<string, string> = {
      INNOVATION: 'Inovação',
      TECHNOLOGY: 'Tecnologia',
      MARKETING: 'Marketing',
      ENTREPRENEURSHIP: 'Empreendedorismo',
      AGRO: 'Agro',
    }
    return themes[theme] || theme
  }

  return (
    <div className={styles.courseCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.courseTitle}>{course.title}</h3>

        <p
          ref={descriptionRef}
          className={`${styles.courseDescription} ${
            showFullDescription ? styles.expanded : ''
          } ${isTextTruncated ? styles.truncated : ''}`}
          onClick={() => {
            if (isTextTruncated) {
              setShowFullDescription(!showFullDescription)
            }
          }}
          style={{ cursor: isTextTruncated ? 'pointer' : 'default' }}
          title={
            isTextTruncated && !showFullDescription
              ? 'Clique para ler mais'
              : ''
          }
        >
          {course.description}
        </p>

        <div className={styles.themesContainer}>
          {course.themes.map((theme) => (
            <span key={theme} className={styles.themeTag}>
              {getThemeLabel(theme)}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.classesSection}>
          <h4 className={styles.classesTitle}>
            <BookOpen className={styles.classesTitleIcon} />
            Turmas Disponíveis ({course.classes.length})
          </h4>

          {course.classes.length === 0 ? (
            <div className={styles.noClasses}>
              <BookOpen className={styles.noClassesIcon} />
              <h5 className={styles.noClassesTitle}>
                Nenhuma turma disponível
              </h5>
              <p className={styles.noClassesDescription}>
                Nenhuma turma disponível no momento
              </p>
            </div>
          ) : (
            <div className={styles.classesList}>
              {course.classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onEnroll={() => onEnroll(classItem.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

interface ClassCardProps {
  classItem: ClassResponseDto
  onEnroll: () => void
}

const ClassCard = memo(({ classItem, onEnroll }: ClassCardProps) => {
  const isEnrollmentPeriod = () => {
    const now = new Date()
    const startDate = new Date(classItem.startDate)
    return now < startDate
  }

  const canEnroll = classItem.status === 'AVAILABLE' && isEnrollmentPeriod()

  return (
    <div className={styles.classItem}>
      <div className={styles.classInfo}>
        <h5 className={styles.classTitle}>{classItem.title}</h5>
        <p className={styles.classDescription}>{classItem.description}</p>
        <div className={styles.classDetails}>
          <div className={styles.classDetail}>
            <Calendar className={styles.classDetailIcon} />
            <span>
              {formatDate(classItem.startDate)} -{' '}
              {formatDate(classItem.endDate)}
            </span>
          </div>
          <div className={styles.classDetail}>
            <Users className={styles.classDetailIcon} />
            <span>Capacidade: {classItem.capacity} alunos</span>
          </div>
        </div>
      </div>

      <div className={styles.classActions}>
        <span
          className={`${styles.statusBadge} ${
            canEnroll ? styles.statusAvailable : styles.statusClosed
          }`}
        >
          {canEnroll ? 'Disponível' : 'Encerrada'}
        </span>

        {canEnroll && (
          <button onClick={onEnroll} className={styles.enrollButton}>
            Matricular
          </button>
        )}

        {!canEnroll && classItem.status === 'CLOSED' && (
          <div className="w-full bg-red-100 text-red-600 text-xs font-medium py-2 px-3 rounded text-center border border-red-200">
            Turma Encerrada
          </div>
        )}
      </div>
    </div>
  )
})

export default CourseCard
