import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatDate } from '../utils/jobs'
import Breadcrumbs from '../components/Breadcrumbs'
import { useJobs } from '../context/JobsContext'

function JobDetailPage() {
  const { jobs } = useJobs()
  const { id } = useParams()
  const job = jobs.find((item) => item.id === id)

  if (!job) {
    return (
      <main className="container page-block">
        <h1>Job not found</h1>
        <p>The requested job does not exist in this sample dataset.</p>
        <Link to="/" className="action-btn secondary">Back to Home</Link>
      </main>
    )
  }

  const relatedJobs = jobs
    .filter((item) => item.id !== job.id && (item.category === job.category || item.organization === job.organization))
    .slice(0, 4)
  const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '-')
  const countryText = job.country || 'In Pakistan'
  const posterImage = job.posterImage || `https://placehold.co/800x1100/eef5ee/1a3f24?text=${encodeURIComponent(
    `${job.organization} Job Poster`
  )}`
  const keywordItems = [
    'Recent / Upcoming / Fresh / Current / New / Latest',
    `${job.title} ${new Date(job.postDate).getFullYear()} March Apply Online ${job.organization}`,
    `Advertisement in Daily ${job.source} Newspaper`,
    `${job.organization}`,
    `${job.industry} Sector`,
    `${job.type} jobs in ${job.city}`,
    `${job.category} Criteria / Educational - Requirements`,
    `How to Apply, Application Deadline / Procedure, Last Date to Apply`
  ]
  const displayKeywords = job.keywords && job.keywords.length ? job.keywords : keywordItems

  return (
    <main className="container page-block">
      <Breadcrumbs jobTitle={job.title} />

      <article className="job-detail">
        <h1>{job.title}</h1>
        <p className="detail-meta">
          {job.organization} | {job.city} | {provinceText} | {countryText} | {job.type} | {job.industry}
        </p>

        <div className="detail-grid">
          <div>
            <h2>Job Description</h2>
            <p>{job.description}</p>

            <h2>Job Positions</h2>
            <ul>
              {(job.jobPositions || job.requirements || []).map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>

            <h2>Application Procedure</h2>
            <p>{job.applyProcedure}</p>
          </div>

          <aside className="detail-card">
            <h3>Job Facts</h3>
            <p><strong>Posting Date:</strong> {formatDate(job.postDate)}</p>
            <p><strong>Deadline:</strong> {formatDate(job.deadline)}</p>
            <p><strong>Source:</strong> {job.source}</p>
            <p><strong>Category:</strong> {job.category}</p>
            <p><strong>Type of Job:</strong> {job.employmentType || '-'}</p>
            <p><strong>Location:</strong> {job.city}, {provinceText}, {countryText}</p>

            <div className="detail-actions">
              <a href={job.applyLink} target="_blank" rel="noreferrer" className="action-btn">Apply Now</a>
              <Link to="/" className="action-btn secondary">Back to Jobs</Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="panel">
        <h2 className="panel-title">Job Poster</h2>
        <div className="poster-page">
          <p className="poster-note-green">Please click the image to view it in original size.</p>
          <div className="poster-wrap">
            <a href={posterImage} target="_blank" rel="noreferrer">
              <img src={posterImage} alt={`${job.title} poster`} />
            </a>
          </div>
          <p className="poster-note-red">Please click the link given near the end of this webpage for further details.</p>
          <p className="poster-note-green">Please click the image to view it in original size.</p>

          <div className="poster-share-box">
            <h3>Share This Ad With Your Friends</h3>
            <div className="poster-share-links">
              <a href="#" aria-label="Share on Facebook">f</a>
              <a href="#" aria-label="Share on Twitter">t</a>
              <a href="#" aria-label="Share by Email">@</a>
            </div>
          </div>
        </div>
      </section>

      <section className="panel bottom-keywords-panel">
        <p className="bottom-label">Keywords:</p>
        <ul>
          {displayKeywords.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="panel bottom-apply-panel">
        <h2>{job.title}</h2>
        <p>
          Please visit the link given below to Apply Online for {job.organization} {job.title}:
        </p>
        <p>
          <a href={job.applyLink} target="_blank" rel="noreferrer">{job.applyLink}</a>
        </p>
      </section>

      <section className="panel bottom-ad-panel">
        <h3>Advertisements</h3>
        <div className="bottom-ad-box">Advertisement Area</div>
      </section>

      <section className="panel related-panel">
        <h2 className="panel-title">Related Jobs</h2>
        <ul className="related-list">
          {relatedJobs.map((item) => (
            <li key={item.id}>
              <Link to={`/job/${item.id}`}>{item.title}</Link>
              <span>{item.organization}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default JobDetailPage
