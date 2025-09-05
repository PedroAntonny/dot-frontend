import { z } from 'zod'
import { UserRole, CourseTheme } from '../types/api'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .trim(),
  email: z
    .string()
    .email({ message: 'Email deve ter um formato válido' })
    .max(255, 'Email não pode exceder 255 caracteres')
    .toLowerCase(),
  role: z.nativeEnum(UserRole, {
    message: 'Função deve ser um valor válido',
  }),
})

export const selectUserSchema = z.object({
  userId: z.uuid('ID do usuário deve ser um UUID válido'),
})

export const createEnrollmentSchema = z.object({
  userId: z.uuid('ID do usuário deve ser um UUID válido'),
  classId: z.uuid('ID da turma deve ser um UUID válido'),
  enrollmentDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true
        const enrollmentDate = new Date(date)
        const now = new Date()

        if (isNaN(enrollmentDate.getTime())) {
          return false
        }

        if (enrollmentDate > now) {
          return false
        }

        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        if (enrollmentDate < oneYearAgo) {
          return false
        }

        return true
      },
      {
        message:
          'Data de matrícula deve ser uma data válida, não pode ser no futuro e não pode ser anterior a 1 ano',
      },
    ),
})

export const createEnrollmentWithClassValidationSchema = (classInfo: {
  startDate: string
  endDate: string
}) =>
  z.object({
    userId: z.uuid('ID do usuário deve ser um UUID válido'),
    classId: z.uuid('ID da turma deve ser um UUID válido'),
    enrollmentDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          if (!date) return true
          const enrollmentDate = new Date(date)
          const now = new Date()
          const classStartDate = new Date(classInfo.startDate)

          if (isNaN(enrollmentDate.getTime())) {
            return false
          }

          if (enrollmentDate > now) {
            return false
          }

          if (enrollmentDate >= classStartDate) {
            return false
          }

          const oneYearAgo = new Date()
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
          if (enrollmentDate < oneYearAgo) {
            return false
          }

          return true
        },
        {
          message:
            'Data de matrícula deve ser anterior ao início da turma e não pode ser no futuro',
        },
      ),
  })

export const courseFiltersSchema = z.object({
  title: z.string().optional(),
  themes: z.array(z.nativeEnum(CourseTheme)).optional(),
})

export const userSearchSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email deve ter um formato válido' })
    .toLowerCase(),
})

export const userSelectionSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email deve ter um formato válido' })
    .toLowerCase(),
  userId: z.string().optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type SelectUserFormData = z.infer<typeof selectUserSchema>
export type CreateEnrollmentFormData = z.infer<typeof createEnrollmentSchema>
export type CourseFiltersFormData = z.infer<typeof courseFiltersSchema>
export type UserSearchFormData = z.infer<typeof userSearchSchema>
export type UserSelectionFormData = z.infer<typeof userSelectionSchema>
