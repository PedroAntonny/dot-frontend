import { Search, Filter, X } from 'lucide-react'
import { CourseTheme } from '@/types/api'
import { Button, Checkbox } from '../ui'
import styles from './CourseFilters.module.css'

interface CourseFiltersProps {
  title: string
  selectedThemes: CourseTheme[]
  onTitleChange: (title: string) => void
  onThemeToggle: (theme: CourseTheme) => void
  onClearFilters: () => void
}

const CourseFilters = ({
  title,
  selectedThemes,
  onTitleChange,
  onThemeToggle,
  onClearFilters,
}: CourseFiltersProps) => {
  const themes = [
    { value: CourseTheme.INNOVATION, label: 'Inovação' },
    { value: CourseTheme.TECHNOLOGY, label: 'Tecnologia' },
    { value: CourseTheme.MARKETING, label: 'Marketing' },
    { value: CourseTheme.ENTREPRENEURSHIP, label: 'Empreendedorismo' },
    { value: CourseTheme.AGRO, label: 'Agro' },
  ]

  const hasActiveFilters = title || selectedThemes.length > 0

  return (
    <div className={styles.filtersCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Filter className={styles.titleIcon} />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button onClick={onClearFilters} variant="outline" size="sm">
            <X className={styles.clearIcon} />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.filterSection}>
          <label className={styles.sectionLabel}>Buscar por título:</label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Digite o título do curso..."
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={styles.searchInput}
            />
            <Search className={styles.searchIcon} />
          </div>
        </div>

        <div className={styles.filterSection}>
          <label className={styles.sectionLabel}>Filtrar por temas:</label>
          <div className={styles.themesContainer}>
            <div className={styles.themesList}>
              {themes.map((theme) => (
                <Checkbox
                  key={theme.value}
                  id={`theme-${theme.value}`}
                  checked={selectedThemes.includes(theme.value)}
                  onChange={() => onThemeToggle(theme.value)}
                  label={theme.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          <div className={styles.activeFiltersLabel}>Filtros ativos:</div>
          <div className={styles.filtersList}>
            {title && (
              <span className={`${styles.filterTag} ${styles.filterTagTitle}`}>
                <Search className={styles.filterTagIcon} />
                Título: "{title}"
              </span>
            )}
            {selectedThemes.map((theme) => {
              const themeLabel = themes.find((t) => t.value === theme)?.label
              return (
                <span
                  key={theme}
                  className={`${styles.filterTag} ${styles.filterTagTheme}`}
                >
                  <Filter className={styles.filterTagIcon} />
                  {themeLabel}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseFilters
