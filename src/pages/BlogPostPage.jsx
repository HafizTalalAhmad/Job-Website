import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { blogPosts } from '../data/blogPosts'

function BlogPostPage() {
  const { id } = useParams()
  const post = blogPosts.find((item) => item.id === id)

  if (!post) {
    return (
      <main className="container page-block">
        <h1>Article not found</h1>
        <p>The article you are looking for is not available.</p>
        <Link to="/blog" className="action-btn secondary">Back to Blog</Link>
      </main>
    )
  }

  return (
    <main className="container page-block">
      <Breadcrumbs />
      <article className="panel blog-detail-panel">
        <div className="blog-meta-row">
          <span>{post.category}</span>
          <span>{post.date}</span>
        </div>
        <h1 className="panel-title">{post.title}</h1>
        <p className="panel-intro">{post.excerpt}</p>
        <div className="blog-detail-content">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Link to="/blog" className="action-btn secondary">Back to Blog</Link>
      </article>
    </main>
  )
}

export default BlogPostPage
