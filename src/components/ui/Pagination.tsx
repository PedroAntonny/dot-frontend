import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPageSelector?: boolean
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = true,
}: PaginationProps) => {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newItemsPerPage = parseInt(e.target.value)
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage)
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        <span>
          Mostrando {startItem} a {endItem} de {totalItems} cursos
        </span>
      </div>

      <div className={styles.paginationNavContainer}>
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={styles.paginationNavButton}
          aria-label="Página anterior"
        >
          <ChevronLeft className={styles.paginationNavButtonIcon} />
          Anterior
        </button>

        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={styles.paginationEllipsis}
              >
                ...
              </span>
            )
          }

          const pageNumber = page as number
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`${styles.paginationButton} ${
                currentPage === pageNumber ? styles.active : ''
              }`}
              aria-label={`Ir para página ${pageNumber}`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          )
        })}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={styles.paginationNavButton}
          aria-label="Próxima página"
        >
          Próxima
          <ChevronRight className={styles.paginationNavButtonIcon} />
        </button>
      </div>

      {showItemsPerPageSelector && onItemsPerPageChange && (
        <div className={styles.paginationSelect}>
          <label htmlFor="items-per-page">Itens por página:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      )}
    </div>
  )
}

export default Pagination
