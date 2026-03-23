import React from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { blogPosts as posts } from '../data/blogPosts'

function BlogPage() {
  return (
    <main className="container page-block">
      <Breadcrumbs />
      <section className="panel">
        <h1 className="panel-title">Blog & Column Writing</h1>
        <p className="panel-intro">
          Career advice, exam preparation, and opinion columns for students, fresh graduates, and professionals.
        </p>
      </section>

      <section className="panel grouped-listing">
        {posts.map((post) => (
          <article key={post.id} className="blog-post-card">
            <div className="blog-meta-row">
              <span>{post.category}</span>
              <span>{post.date}</span>
            </div>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <Link to={`/blog/${post.id}`}>Read Full Article</Link>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2 className="panel-title">Write For Us</h2>
        <p className="panel-intro">
          Want to publish your career column? Send your draft and profile via Contact Us page. We review and publish selected entries.
        </p>
      </section>
    </main>
  )
}

export default BlogPage
