import React from 'react'

function BookmarkPrompt({ open, onClose }) {
  if (!open) return null

  return (
    <div className="bookmark-overlay" role="presentation" onClick={onClose}>
      <div
        className="bookmark-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="bookmark-kicker">Quick Tip</span>
        <h2 id="bookmark-title">Bookmark This Page</h2>
        <p>
          Save this page so you can come back quickly to the jobs you need.
        </p>
        <ul className="bookmark-steps">
          <li>On computer: press <strong>Ctrl + D</strong>.</li>
          <li>On mobile: open your browser menu and choose <strong>Add bookmark</strong> or <strong>Add to Home Screen</strong>.</li>
        </ul>
        <div className="bookmark-actions">
          <button type="button" className="action-btn" onClick={onClose}>Got It</button>
        </div>
      </div>
    </div>
  )
}

export default BookmarkPrompt
