import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Search,
  User,
  Calendar,
  AlertCircle,
  GraduationCap,
} from 'lucide-react'
import { Alert, Select } from '../ui'
import { userApi, enrollmentApi, courseApi, classApi } from '@/lib/api'
import { userSelectionSchema, UserSelectionFormData } from '@/lib/validations'
import {
  UserResponseDto,
  ClassResponseDto,
  CourseResponseDto,
} from '@/types/api'
import { formatDate, formatDateTime } from '@/lib/utils'
import styles from './EnrollmentView.module.css'

interface EnrollmentWithDetails {
  id: string
  userId: string
  classId: string
  enrollmentDate: string
  createdAt: string
  updatedAt: string
  class: ClassResponseDto | null
  course: CourseResponseDto | null
}

const EnrollmentView = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
  const [foundUser, setFoundUser] = useState<UserResponseDto | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserSelectionFormData>({
    resolver: zodResolver(userSelectionSchema),
  })

  const selectedUserId = watch('userId')

  const loadUsers = async () => {
    try {
      const usersData = await userApi.getAll()
      setUsers(usersData)
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const loadUserEnrollments = useCallback(
    async (userId: string) => {
      try {
        setIsTransitioning(true)
        setError(null)

        const enrollmentsData = await enrollmentApi.getByUser(userId)

        const enrichedEnrollments = await Promise.all(
          enrollmentsData.map(async (enrollment) => {
            try {
              const classData = await classApi.getById(enrollment.classId)

              const courseData = await courseApi.getById(classData.courseId)

              return {
                ...enrollment,
                class: classData,
                course: courseData,
              }
            } catch (err) {
              console.error(
                `Error loading data for enrollment ${enrollment.id}:`,
                err,
              )
              return {
                ...enrollment,
                class: null,
                course: null,
              }
            }
          }),
        )

        await new Promise((resolve) => setTimeout(resolve, 200))

        setEnrollments(enrichedEnrollments)

        const user = users.find((u) => u.id === userId)
        setSelectedUser(user || null)
      } catch (err) {
        setError('Erro ao carregar matrículas. Tente novamente.')
        console.error('Error loading enrollments:', err)
      } finally {
        setIsTransitioning(false)
      }
    },
    [users],
  )

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      loadUserEnrollments(selectedUserId)
    }
  }, [selectedUserId, loadUserEnrollments])

  const searchUserByEmail = async (data: UserSelectionFormData) => {
    try {
      setLoading(true)
      setError(null)

      const user = await userApi.getByEmail(data.email)
      setFoundUser(user)

      if (user) {
        setValue('userId', user.id)
        await loadUserEnrollments(user.id)
      } else {
        setError('Usuário não encontrado com este e-mail.')
      }
    } catch {
      setError('Erro ao buscar usuário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = async (userId: string) => {
    if (userId) {
      await loadUserEnrollments(userId)
    } else {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedUser(null)
        setEnrollments([])
        setIsTransitioning(false)
      }, 200)
    }
  }

  return (
    <div className={styles.enrollmentContainer}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Visualizar Matrículas</h2>
        <p className={styles.pageDescription}>
          Consulte as matrículas de um usuário específico.
        </p>
      </div>

      <div className={styles.searchGrid}>
        <div className={styles.searchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <h3 className={styles.headerTitle}>
                <Search className={styles.headerIcon} />
                Buscar por E-mail
              </h3>
            </div>
          </div>

          <div className={styles.cardContent}>
            <form
              onSubmit={handleSubmit(searchUserByEmail)}
              className={styles.searchForm}
            >
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>E-mail do usuário</label>
                <input
                  type="email"
                  placeholder="Digite o e-mail"
                  className={`${styles.fieldInput} ${
                    errors.email ? styles.error : ''
                  }`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className={styles.fieldError}>{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                className={`${styles.searchButton} ${
                  loading ? styles.loading : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar Usuário'}
              </button>
            </form>

            {foundUser && (
              <div className={styles.foundUserCard}>
                <div className={styles.foundUserContent}>
                  <User className={styles.foundUserIcon} />
                  <div className={styles.foundUserInfo}>
                    <p className={styles.foundUserName}>{foundUser.name}</p>
                    <p className={styles.foundUserEmail}>{foundUser.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerContent}>
              <h3 className={styles.headerTitle}>
                <User className={styles.headerIcon} />
                Selecionar Usuário
              </h3>
            </div>
          </div>

          <div className={styles.cardContent}>
            <Select
              label="Usuário"
              placeholder="Escolha um usuário"
              variant="enrollment"
              options={users.map((user) => ({
                value: user.id,
                label: `${user.name} (${user.email})`,
              }))}
              error={errors.userId?.message}
              {...register('userId', {
                onChange: (e) => handleUserSelect(e.target.value),
              })}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.alertContainer}>
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="w-4 h-4" />
            {error}
          </Alert>
        </div>
      )}

      {selectedUser && (
        <div
          className={`${styles.enrollmentsCard} ${
            isTransitioning ? styles.transitioning : ''
          }`}
        >
          <div className={styles.enrollmentsHeader}>
            <div className={styles.enrollmentsHeaderContent}>
              <h3 className={styles.enrollmentsTitle}>
                Matrículas de {selectedUser.name}
              </h3>
              <p className={styles.enrollmentsSubtitle}>
                {selectedUser.email} • {enrollments.length} matrícula(s)
              </p>
            </div>
          </div>

          <div className={styles.enrollmentsContent}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>Carregando matrículas...</p>
              </div>
            ) : enrollments.length === 0 ? (
              <div className={styles.emptyContainer}>
                <GraduationCap className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>
                  Nenhuma matrícula encontrada
                </h4>
                <p className={styles.emptyDescription}>
                  Este usuário ainda não possui matrículas no sistema.
                </p>
              </div>
            ) : (
              <div className={styles.enrollmentsList}>
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className={styles.enrollmentItem}>
                    <div className={styles.enrollmentContent}>
                      <div className={styles.enrollmentInfo}>
                        <h4 className={styles.enrollmentCourseTitle}>
                          {enrollment.course?.title || 'Curso não encontrado'}
                        </h4>
                        <p className={styles.enrollmentClassTitle}>
                          {enrollment.class?.title || 'Turma não encontrada'}
                        </p>
                        <p className={styles.enrollmentDescription}>
                          {enrollment.course?.description ||
                            'Descrição não disponível'}
                        </p>

                        <div className={styles.enrollmentDetails}>
                          <div className={styles.enrollmentDetail}>
                            <Calendar className={styles.enrollmentDetailIcon} />
                            <span>
                              {enrollment.class?.startDate
                                ? formatDate(enrollment.class.startDate)
                                : 'N/A'}{' '}
                              -{' '}
                              {enrollment.class?.endDate
                                ? formatDate(enrollment.class.endDate)
                                : 'N/A'}
                            </span>
                          </div>
                          <div className={styles.enrollmentDetail}>
                            <User className={styles.enrollmentDetailIcon} />
                            <span>
                              Capacidade: {enrollment.class?.capacity || 'N/A'}{' '}
                              alunos
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.enrollmentActions}>
                        <div
                          className={`${styles.statusBadge} ${
                            enrollment.class?.status === 'AVAILABLE'
                              ? styles.statusActive
                              : styles.statusClosed
                          }`}
                        >
                          {enrollment.class?.status === 'AVAILABLE'
                            ? 'Ativa'
                            : enrollment.class?.status === 'CLOSED'
                            ? 'Encerrada'
                            : 'Status desconhecido'}
                        </div>
                        <p className={styles.enrollmentDate}>
                          Matriculado em{' '}
                          {formatDateTime(enrollment.enrollmentDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnrollmentView
