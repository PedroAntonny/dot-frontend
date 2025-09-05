import axios from 'axios'
import type {
  UserResponseDto,
  CreateUserDto,
  CourseResponseDto,
  ClassResponseDto,
  EnrollmentResponseDto,
  EnrollmentWithDetailsDto,
  CreateEnrollmentDto,
  CourseFilters,
  CourseWithClasses,
} from '../types/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const userApi = {
  create: async (data: CreateUserDto): Promise<UserResponseDto> => {
    const response = await api.post('/users', data)
    return response.data
  },

  getAll: async (): Promise<UserResponseDto[]> => {
    const response = await api.get('/users')
    return response.data
  },

  getById: async (id: string): Promise<UserResponseDto> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  update: async (
    id: string,
    data: Partial<CreateUserDto>,
  ): Promise<UserResponseDto> => {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },

  getByEmail: async (email: string): Promise<UserResponseDto | null> => {
    try {
      const users = await userApi.getAll()
      return users.find((user) => user.email === email) || null
    } catch {
      return null
    }
  },
}

export const courseApi = {
  create: async (
    data: Partial<CourseResponseDto>,
  ): Promise<CourseResponseDto> => {
    const response = await api.post('/courses', data)
    return response.data
  },

  getAll: async (filters?: CourseFilters): Promise<CourseResponseDto[]> => {
    const params = new URLSearchParams()
    if (filters?.theme) params.append('theme', filters.theme)
    if (filters?.title) params.append('title', filters.title)

    const response = await api.get(`/courses?${params.toString()}`)
    return response.data
  },

  getById: async (id: string): Promise<CourseResponseDto> => {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },

  update: async (
    id: string,
    data: Partial<CourseResponseDto>,
  ): Promise<CourseResponseDto> => {
    const response = await api.put(`/courses/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/courses/${id}`)
  },
}

export const classApi = {
  create: async (
    data: Partial<ClassResponseDto>,
  ): Promise<ClassResponseDto> => {
    const response = await api.post('/classes', data)
    return response.data
  },

  getAvailable: async (): Promise<ClassResponseDto[]> => {
    const response = await api.get('/classes/available')
    return response.data
  },

  getById: async (id: string): Promise<ClassResponseDto> => {
    const response = await api.get(`/classes/${id}`)
    return response.data
  },

  update: async (
    id: string,
    data: Partial<ClassResponseDto>,
  ): Promise<ClassResponseDto> => {
    const response = await api.put(`/classes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`)
  },
}

export const enrollmentApi = {
  create: async (data: CreateEnrollmentDto): Promise<EnrollmentResponseDto> => {
    const response = await api.post('/enrollments', data)
    return response.data
  },

  getByUser: async (userId: string): Promise<EnrollmentWithDetailsDto[]> => {
    const response = await api.get(`/enrollments/user/${userId}`)
    return response.data
  },

  getByClass: async (classId: string): Promise<EnrollmentWithDetailsDto[]> => {
    const response = await api.get(`/enrollments/class/${classId}`)
    return response.data
  },

  cancel: async (id: string): Promise<void> => {
    await api.delete(`/enrollments/${id}`)
  },
}

export const getCoursesWithClasses = async (
  filters?: CourseFilters,
): Promise<CourseWithClasses[]> => {
  const [courses, availableClasses] = await Promise.all([
    courseApi.getAll(filters),
    classApi.getAvailable(),
  ])

  return courses.map((course) => ({
    ...course,
    classes: availableClasses.filter((cls) => cls.courseId === course.id),
  }))
}

export default api
