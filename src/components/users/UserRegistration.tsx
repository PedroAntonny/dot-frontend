import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { Alert, Input, Select, Button } from '../ui'
import { userApi } from '@/lib/api'
import { createUserSchema, CreateUserFormData } from '@/lib/validations'
import { UserRole, UserResponseDto } from '@/types/api'
import styles from './UserRegistration.module.css'

interface UserRegistrationProps {
  onUserCreated?: (user: UserResponseDto) => void
}

const UserRegistration = ({ onUserCreated }: UserRegistrationProps) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: UserRole.STUDENT,
    },
  })

  const roleOptions = [
    { value: UserRole.STUDENT, label: 'Estudante' },
    { value: UserRole.INSTRUCTOR, label: 'Instrutor' },
    { value: UserRole.ADMIN, label: 'Administrador' },
  ]

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const user = await userApi.create(data)

      setSuccess(`Usuário ${user.name} criado com sucesso!`)
      reset()

      if (onUserCreated) {
        onUserCreated(user)
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Erro ao criar usuário. Tente novamente.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.registrationCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <h3 className={styles.headerTitle}>
            <UserPlus className={styles.headerIcon} />
            Cadastro de Usuário
          </h3>
          <p className={styles.headerDescription}>
            Preencha os dados abaixo para criar um novo usuário no sistema.
          </p>
        </div>
      </div>

      <div className={styles.cardContent}>
        {success && (
          <div className={styles.alertContainer}>
            <Alert
              variant="success"
              title="Cadastro realizado"
              dismissible
              onDismiss={() => setSuccess(null)}
            >
              {success}
            </Alert>
          </div>
        )}

        {error && (
          <div className={styles.alertContainer}>
            <Alert
              variant="error"
              title="Erro no cadastro"
              dismissible
              onDismiss={() => setError(null)}
            >
              {error}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <Input
                label="Nome completo"
                type="text"
                placeholder="Digite o nome completo"
                error={errors.name?.message}
                variant="enrollment"
                {...register('name')}
              />
            </div>

            <div className={styles.formField}>
              <Input
                label="E-mail"
                type="email"
                placeholder="Digite o e-mail"
                error={errors.email?.message}
                variant="enrollment"
                {...register('email')}
              />
            </div>

            <div className={styles.formField}>
              <Select
                label="Função"
                options={roleOptions}
                error={errors.role?.message}
                variant="enrollment"
                {...register('role')}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={loading}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserRegistration
