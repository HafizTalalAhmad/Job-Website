import React from 'react'

function BookmarkPrompt({ open, onClose, onConfirm, isBookmarked }) {
  if (!open) return null

  return (
    <div className="bookmark-toast-shell" role="presentation">
      <div className="bookmark-modal" role="dialog" aria-modal="true" aria-labelledby="bookmark-title">
        <span className="bookmark-kicker">Quick Tip</span>
        <h2 id="bookmark-title">{isBookmarked ? 'Page Bookmarked' : 'Bookmark This Page?'}</h2>
        <p>
          {isBookmarked
            ? 'This page is now saved in your quick bookmarks for easy return later.'
            : 'Would you like to save this page for quick access later?'}
        </p>
        <div className="bookmark-actions">
          {!isBookmarked && (
            <button type="button" className="action-btn" onClick={onConfirm}>Yes</button>
          )}
          <button type="button" className="action-btn secondary" onClick={onClose}>
            {isBookmarked ? 'Close' : 'Later'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookmarkPrompt
