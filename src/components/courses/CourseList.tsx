import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, Pagination } from '../ui'
import CourseCard from './CourseCard'
import CourseFilters from './CourseFilters'
import EnrollmentModal from '../enrollments/EnrollmentModal'
import { getCoursesWithClasses } from '@/lib/api'
import { CourseWithClasses, CourseTheme } from '@/types/api'
import { debounce } from '@/lib/utils'
import styles from './CourseList.module.css'

const CourseList = memo(() => {
  const [allCourses, setAllCourses] = useState<CourseWithClasses[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseWithClasses[]>(
    [],
  )
  const [courses, setCourses] = useState<CourseWithClasses[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [titleFilter, setTitleFilter] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<CourseTheme[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [isFullyLoaded, setIsFullyLoaded] = useState(false)
  const [enrollmentModal, setEnrollmentModal] = useState<{
    isOpen: boolean
    classId: string
  }>({
    isOpen: false,
    classId: '',
  })

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCoursesWithClasses()
      setAllCourses(data)
      setIsFullyLoaded(true)
    } catch (err) {
      setError('Erro ao carregar cursos. Tente novamente.')
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const applyFilters = useCallback(
    (title: string, themes: CourseTheme[], resetPage = true) => {
      if (allCourses.length === 0) return

      let filtered = allCourses

      if (title.trim()) {
        filtered = filtered.filter((course) =>
          course.title.toLowerCase().includes(title.toLowerCase()),
        )
      }

      if (themes.length > 0) {
        filtered = filtered.filter((course) =>
          themes.some((theme) => course.themes.includes(theme)),
        )
      }

      setFilteredCourses(filtered)
      if (resetPage) {
        setCurrentPage(1)
      }
    },
    [allCourses],
  )

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (isFullyLoaded && allCourses.length > 0) {
      applyFilters(titleFilter, selectedThemes, false)
    }
  }, [
    isFullyLoaded,
    allCourses.length,
    applyFilters,
    titleFilter,
    selectedThemes,
  ])

  useEffect(() => {
    if (isFullyLoaded && allCourses.length > 0) {
      const debouncedApply = debounce(() => {
        applyFilters(titleFilter, selectedThemes, true)
      }, 300)
      debouncedApply()
    }
  }, [
    titleFilter,
    selectedThemes,
    isFullyLoaded,
    allCourses.length,
    applyFilters,
  ])

  useEffect(() => {
    if (isFullyLoaded && filteredCourses.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedCourses = filteredCourses.slice(startIndex, endIndex)
      setCourses(paginatedCourses)
    }
  }, [filteredCourses, currentPage, itemsPerPage, isFullyLoaded])

  const handleTitleChange = useCallback((title: string) => {
    setTitleFilter(title)
  }, [])

  const handleThemeToggle = useCallback((theme: CourseTheme) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    )
  }, [])

  const handleClearFilters = useCallback(() => {
    setTitleFilter('')
    setSelectedThemes([])
  }, [])

  const handleEnroll = useCallback((classId: string) => {
    setEnrollmentModal({
      isOpen: true,
      classId,
    })
  }, [])

  const handleEnrollmentSuccess = useCallback(() => {
    setEnrollmentModal({
      isOpen: false,
      classId: '',
    })
  }, [])

  const scrollToCourseList = useCallback(() => {
    setTimeout(() => {
      const courseListElement = document.getElementById('course-list')
      if (courseListElement) {
        const elementRect = courseListElement.getBoundingClientRect()
        const absoluteElementTop = elementRect.top + window.pageYOffset
        const offset = 100

        window.scrollTo({
          top: absoluteElementTop - offset,
          behavior: 'smooth',
        })
      }
    }, 100)
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      scrollToCourseList()
    },
    [scrollToCourseList],
  )

  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage)
      setCurrentPage(1)
      scrollToCourseList()
    },
    [scrollToCourseList],
  )

  const totalItems = useMemo(
    () => filteredCourses.length,
    [filteredCourses.length],
  )
  const totalPages = useMemo(
    () => Math.ceil(totalItems / itemsPerPage),
    [totalItems, itemsPerPage],
  )

  const courseCards = useMemo(
    () =>
      courses.map((course) => (
        <CourseCard key={course.id} course={course} onEnroll={handleEnroll} />
      )),
    [courses, handleEnroll],
  )

  if (loading && !isFullyLoaded) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Carregando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cursos Disponíveis
        </h2>
        <p className="text-gray-600">
          Explore nossos cursos e encontre a turma ideal para você.
        </p>
      </div>

      {isFullyLoaded && (
        <CourseFilters
          title={titleFilter}
          selectedThemes={selectedThemes}
          onTitleChange={handleTitleChange}
          onThemeToggle={handleThemeToggle}
          onClearFilters={handleClearFilters}
        />
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          {error}
        </Alert>
      )}

      {loading && courses.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
          <span className="text-gray-600">Atualizando...</span>
        </div>
      )}

      {courses.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>
      )}

      {isFullyLoaded && courses.length > 0 && (
        <>
          <div id="course-list" className={styles.courseGrid}>
            {courseCards}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPageSelector={true}
            />
          )}
        </>
      )}

      <EnrollmentModal
        classId={enrollmentModal.classId}
        isOpen={enrollmentModal.isOpen}
        onClose={() => setEnrollmentModal({ isOpen: false, classId: '' })}
        onSuccess={handleEnrollmentSuccess}
      />
    </div>
  )
})

CourseList.displayName = 'CourseList'

export default CourseList
