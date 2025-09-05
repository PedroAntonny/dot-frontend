export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
}

export enum CourseTheme {
  INNOVATION = 'INNOVATION',
  TECHNOLOGY = 'TECHNOLOGY',
  MARKETING = 'MARKETING',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  AGRO = 'AGRO',
}

export enum ClassStatus {
  AVAILABLE = 'AVAILABLE',
  CLOSED = 'CLOSED',
}

export interface CreateUserDto {
  name: string
  email: string
  role: UserRole
}

export interface CreateEnrollmentDto {
  userId: string
  classId: string
  enrollmentDate?: string
}

export interface UserResponseDto {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface CourseResponseDto {
  id: string
  title: string
  description: string
  themes: CourseTheme[]
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ClassResponseDto {
  id: string
  title: string
  description: string
  capacity: number
  status: ClassStatus
  startDate: string
  endDate: string
  courseId: string
  createdAt: string
  updatedAt: string
}

export interface EnrollmentResponseDto {
  id: string
  userId: string
  classId: string
  enrollmentDate: string
  createdAt: string
  updatedAt: string
}

export interface EnrollmentWithDetailsDto {
  id: string
  userId: string
  classId: string
  enrollmentDate: string
  createdAt: string
  updatedAt: string
  user: UserResponseDto
  class: ClassResponseDto
}

export interface CourseFilters {
  theme?: CourseTheme
  title?: string
}

export interface UserFormData {
  name: string
  email: string
  role: UserRole
}

export interface EnrollmentFormData {
  userId: string
  classId: string
  enrollmentDate?: string
}

export interface CourseWithClasses extends CourseResponseDto {
  classes: ClassResponseDto[]
}

export interface UserWithEnrollments extends UserResponseDto {
  enrollments: EnrollmentWithDetailsDto[]
}
