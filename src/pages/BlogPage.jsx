import React from 'react'
import Breadcrumbs from '../components/Breadcrumbs'

const posts = [
  {
    id: 1,
    title: 'How to Write a Job-Winning CV for Pakistan Market',
    category: 'Career Tips',
    date: 'March 10, 2026',
    excerpt: 'Learn how to structure your CV for government and private sector jobs with clear achievements and role-specific keywords.'
  },
  {
    id: 2,
    title: 'Government vs Private Jobs: Which Path Fits You?',
    category: 'Columns',
    date: 'March 8, 2026',
    excerpt: 'A practical comparison of stability, growth, salary progression, and work style to help you decide your direction.'
  },
  {
    id: 3,
    title: 'How to Prepare for Written Tests and Interviews',
    category: 'Exam Prep',
    date: 'March 6, 2026',
    excerpt: 'A step-by-step preparation plan for NTS/FPSC style tests and panel interviews, with weekly study checkpoints.'
  },
  {
    id: 4,
    title: 'Common Mistakes in Online Applications',
    category: 'Guides',
    date: 'March 4, 2026',
    excerpt: 'Avoid the top mistakes that cause rejection, from incomplete forms to document formatting and deadline issues.'
  }
]

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
            <a href="#">Read Full Article</a>
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
