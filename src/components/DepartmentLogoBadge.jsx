import React, { useState } from 'react'

function DepartmentLogoBadge({ department, large = false }) {
  const [hasError, setHasError] = useState(false)

  if (department.logo && !hasError) {
    return (
      <img
        src={department.logo}
        alt={`${department.name} logo`}
        className={`department-logo-image${large ? ' large' : ''}`}
        onError={() => setHasError(true)}
      />
    )
  }

  return <span className={`department-logo-badge${large ? ' large' : ''}`}>{department.logoText}</span>
}

export default DepartmentLogoBadge
