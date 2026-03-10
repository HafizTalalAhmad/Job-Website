import React from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from '../data/jobs'

function Navbar() {
  return (
    <nav className="main-nav" aria-label="Main navigation">
      <div className="container nav-row">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navbar
