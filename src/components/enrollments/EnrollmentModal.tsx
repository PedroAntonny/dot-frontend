import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, User, AlertCircle } from 'lucide-react'
import { userApi, enrollmentApi, classApi } from '@/lib/api'
import {
  createEnrollmentSchema,
  createEnrollmentWithClassValidationSchema,
  CreateEnrollmentFormData,
} from '@/lib/validations'
import { UserResponseDto, ClassResponseDto } from '@/types/api'
import { Button, Alert } from '@/components/ui'
import Select from '@/components/ui/Select'
import inputStyles from '@/components/ui/Input.module.css'
import styles from './EnrollmentModal.module.css'

interface EnrollmentModalProps {
  classId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const EnrollmentModal = ({
  classId,
  isOpen,
  onClose,
  onSuccess,
}: EnrollmentModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [classInfo, setClassInfo] = useState<ClassResponseDto | null>(null)
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [currentEnrollments, setCurrentEnrollments] = useState(0)

  const [searchEmail, setSearchEmail] = useState('')
  const [foundUser, setFoundUser] = useState<UserResponseDto | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [localSelectedUserId, setLocalSelectedUserId] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const isModalOpenRef = useRef(false)

  const formResolver = useMemo(() => {
    return zodResolver(
      classInfo
        ? createEnrollmentWithClassValidationSchema(classInfo)
        : createEnrollmentSchema,
    )
  }, [classInfo])

  const {
    register,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateEnrollmentFormData>({
    resolver: formResolver,
    defaultValues: {
      classId: classId || '',
      userId: '',
    },
  })

  const checkUserEnrollmentStatus = useCallback(
    async (userId: string, courseId: string): Promise<boolean> => {
      try {
        const userEnrollments = await enrollmentApi.getByUser(userId)
        return userEnrollments.some(
          (enrollment) => enrollment.class?.courseId === courseId,
        )
      } catch (err) {
        console.error('Error checking enrollment status:', err)
        return false
      }
    },
    [],
  )

  const searchUser = useCallback(
    async (email: string) => {
      if (!email.trim()) {
        setFoundUser(null)
        setLocalSelectedUserId('')
        setSearchError(null)
        return
      }

      try {
        setIsSearching(true)
        setError(null)
        setSearchError(null)
        setFoundUser(null)

        const user = await userApi.getByEmail(email)
        setFoundUser(user)

        if (user && classInfo) {
          const isEnrolled = await checkUserEnrollmentStatus(
            user.id,
            classInfo.courseId,
          )

          if (isEnrolled) {
            setLocalSelectedUserId('')
            setSearchError(
              'Este usuário já está matriculado em uma turma deste curso. Não é possível se matricular novamente.',
            )
          } else {
            setLocalSelectedUserId(user.id)
            setSearchError(null)
          }
        } else if (user) {
          setLocalSelectedUserId(user.id)
          setSearchError(null)
        } else {
          setLocalSelectedUserId('')
          setSearchError('Usuário não encontrado. Verifique o e-mail digitado.')
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        setFoundUser(null)
        setLocalSelectedUserId('')
        setSearchError('Usuário não encontrado. Verifique o e-mail digitado.')
      } finally {
        setIsSearching(false)
      }
    },
    [classInfo, checkUserEnrollmentStatus],
  )

  const handleSearchUser = () => {
    searchUser(searchEmail)
  }

  useEffect(() => {
    setValue('userId', localSelectedUserId)
  }, [localSelectedUserId, setValue])

  const loadClassInfo = useCallback(async (classIdToLoad: string) => {
    try {
      const classData = await classApi.getById(classIdToLoad)
      setClassInfo(classData)

      const enrollments = await enrollmentApi.getByClass(classIdToLoad)
      setCurrentEnrollments(enrollments.length)
    } catch (err) {
      console.error('Error loading class info:', err)
    }
  }, [])

  useEffect(() => {
    if (isOpen && classId && !isModalOpenRef.current) {
      isModalOpenRef.current = true
      setLocalSelectedUserId('')
      setFoundUser(null)
      setError(null)
      setSuccess(null)
      setSearchError(null)
      loadClassInfo(classId)
    } else if (!isOpen) {
      isModalOpenRef.current = false
    }
  }, [isOpen, classId, loadClassInfo])

  const getEnrolledUserIdsInCourse = useCallback(
    async (courseId: string): Promise<string[]> => {
      try {
        const allUsers = await userApi.getAll()

        const enrollmentChecks = await Promise.all(
          allUsers.map(async (user) => {
            try {
              const userEnrollments = await enrollmentApi.getByUser(user.id)
              const isEnrolledInCourse = userEnrollments.some(
                (enrollment) => enrollment.class?.courseId === courseId,
              )
              return isEnrolledInCourse ? user.id : null
            } catch (err) {
              console.error(
                `Error checking enrollment for user ${user.id}:`,
                err,
              )
              return null
            }
          }),
        )

        return enrollmentChecks.filter((id): id is string => id !== null)
      } catch (err) {
        console.error('Error getting enrolled user IDs:', err)
        return []
      }
    },
    [],
  )

  const loadUsers = useCallback(
    async (courseId: string) => {
      try {
        const usersData = await userApi.getAll()
        const enrolledUserIds = await getEnrolledUserIdsInCourse(courseId)
        const availableUsers = usersData.filter(
          (user) => !enrolledUserIds.includes(user.id),
        )
        setUsers(availableUsers)
      } catch (err) {
        console.error('Error loading users:', err)
      }
    },
    [getEnrolledUserIdsInCourse],
  )

  useEffect(() => {
    if (isOpen && classInfo?.courseId) {
      loadUsers(classInfo.courseId)
    }
  }, [isOpen, classInfo?.courseId, loadUsers])

  const checkExistingEnrollment = useCallback(
    async (
      userId: string,
      courseId: string,
      classData: ClassResponseDto,
      currentEnrollmentsCount: number,
    ) => {
      try {
        const enrollments = await enrollmentApi.getByUser(userId)
        const existingCourseEnrollment = enrollments.find(
          (enrollment) => enrollment.class?.courseId === courseId,
        )

        if (existingCourseEnrollment) {
          setError(
            'Usuário já está matriculado em uma turma deste curso. Não é possível se matricular em mais de uma turma do mesmo curso.',
          )
          return false
        }

        if (classData.status === 'CLOSED') {
          setError('Turma está encerrada. Não é possível realizar matrículas.')
          return false
        }

        if (currentEnrollmentsCount >= classData.capacity) {
          setError(
            'Turma está lotada. Não é possível realizar mais matrículas.',
          )
          return false
        }

        const now = new Date()
        const startDate = new Date(classData.startDate)
        const endDate = new Date(classData.endDate)

        if (now >= startDate) {
          setError('Não é possível se matricular após o início da turma.')
          return false
        }

        if (now > endDate) {
          setError('Não é possível se matricular após o fim da turma.')
          return false
        }

        setError(null)
        return true
      } catch (err) {
        console.error('Erro ao verificar matrículas existentes:', err)
        setError(null)
        return true
      }
    },
    [],
  )

  const onSubmit = async (data: CreateEnrollmentFormData) => {
    const enrollmentData = {
      ...data,
      classId: classId,
    }

    if (!enrollmentData.userId) {
      setError('Usuário não selecionado.')
      return
    }

    if (!enrollmentData.classId || !classInfo) {
      setError('Turma não identificada.')
      return
    }

    const isValid = await checkExistingEnrollment(
      enrollmentData.userId,
      classInfo.courseId,
      classInfo,
      currentEnrollments,
    )

    if (!isValid) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      await enrollmentApi.create(enrollmentData)

      setSuccess('Matrícula realizada com sucesso!')

      setTimeout(() => {
        onClose()
        reset()
        setFoundUser(null)
        setSearchEmail('')
        setLocalSelectedUserId('')
        setError(null)
        setSuccess(null)
        onSuccess()
      }, 1500)
    } catch (err: unknown) {
      console.error('Erro ao criar matrícula:', err)
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Erro ao realizar matrícula. Tente novamente.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = useCallback(() => {
    onClose()
    reset()
    setError(null)
    setSuccess(null)
    setFoundUser(null)
    setSearchEmail('')
    setLocalSelectedUserId('')
    setSearchError(null)
  }, [onClose, reset])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Realizar Matrícula</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className={styles.modalBody}>
          {classInfo && (
            <div className={styles.classInfo}>
              <h4 className={styles.classTitle}>{classInfo.title}</h4>
              <p className={styles.classDescription}>{classInfo.description}</p>
              <div className={styles.classCapacity}>
                <div className={styles.capacityInfo}>
                  <span>Capacidade: {classInfo.capacity} alunos</span>
                  <span className={styles.capacityStatus}>
                    ({currentEnrollments} matriculados)
                  </span>
                </div>
                {currentEnrollments >= classInfo.capacity && (
                  <div className={styles.capacityWarning}>
                    Turma lotada - Não é possível realizar mais matrículas
                  </div>
                )}
              </div>
            </div>
          )}

          {success && (
            <Alert
              variant="success"
              dismissible
              onDismiss={() => setSuccess(null)}
              className={styles.alertContainer}
            >
              {success}
            </Alert>
          )}

          {error && (
            <Alert
              variant="error"
              dismissible
              onDismiss={() => setError(null)}
              className={styles.alertContainer}
            >
              {error}
            </Alert>
          )}

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              Buscar usuário por e-mail
            </label>
            <div className={styles.searchContainer}>
              <div className={inputStyles.inputGroup}>
                <div className={inputStyles.inputWrapper}>
                  <input
                    type="email"
                    placeholder="Digite o e-mail do usuário"
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value)
                      setError(null)
                      setSearchError(null)
                    }}
                    className={`${inputStyles.input} ${inputStyles.modalStyle} ${styles.searchInput}`}
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleSearchUser}
                disabled={!searchEmail.trim() || isSearching}
                loading={isSearching}
                className={styles.searchButton}
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {searchError && searchEmail && !foundUser && !isSearching && (
              <Alert variant="error" className={styles.searchErrorMessage}>
                {searchError}
              </Alert>
            )}

            {foundUser && !isSearching && (
              <div className={styles.foundUser}>
                <User className={styles.foundUserIcon} />
                <div className={styles.foundUserInfo}>
                  <p className={styles.foundUserName}>{foundUser.name}</p>
                  <p className={styles.foundUserEmail}>{foundUser.email}</p>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit({
                classId: classId || '',
                userId: localSelectedUserId,
              })
            }}
          >
            <input type="hidden" {...register('classId')} />

            <div className={styles.formSection}>
              <Select
                label="Selecionar usuário"
                placeholder="Escolha um usuário"
                variant="modal"
                options={users.map((user) => ({
                  value: user.id,
                  label: `${user.name} (${user.email})`,
                }))}
                error={errors.userId?.message}
                {...register('userId', {
                  onChange: async (e) => {
                    const userId = e.target.value
                    setLocalSelectedUserId(userId)

                    if (userId && classInfo) {
                      setError(null)
                      checkExistingEnrollment(
                        userId,
                        classInfo.courseId,
                        classInfo,
                        currentEnrollments,
                      ).catch(console.error)
                    }
                  },
                })}
              />

              {users.length === 0 && classInfo && (
                <div className={styles.infoMessage}>
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Todos os usuários já estão matriculados neste curso. Use a
                    busca por e-mail para verificar o status de um usuário
                    específico.
                  </span>
                </div>
              )}
            </div>

            <div className={styles.actionButtons}>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  loading || !localSelectedUserId || !!error || !!searchError
                }
                loading={loading}
                className={styles.enrollButton}
              >
                {loading ? 'Matriculando...' : 'Matricular'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EnrollmentModal
