import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatDate } from '../utils/jobs'
import Breadcrumbs from '../components/Breadcrumbs'
import { useJobs } from '../context/JobsContext'

function JobDetailPage() {
  const { allJobs } = useJobs()
  const { id } = useParams()
  const job = allJobs.find((item) => item.id === id)

  if (!job) {
    return (
      <main className="container page-block">
        <h1>Job not found</h1>
        <p>The requested job does not exist in this sample dataset.</p>
        <Link to="/" className="action-btn secondary">Back to Home</Link>
      </main>
    )
  }

  const isPrivateJob = job.type === 'private'
  const parentTo = isPrivateJob ? '/jobs/private' : '/jobs/government'
  const parentLabel = isPrivateJob ? 'Private Jobs' : 'Government Jobs'
  const heroLabel = isPrivateJob ? 'Private Sector Opportunity' : 'Government Opportunity'
  const factsTitle = isPrivateJob ? 'Private Job Snapshot' : 'Job Facts'
  const applyButtonLabel = isPrivateJob ? 'Open Company Apply Link' : 'Apply Now'
  const backButtonLabel = isPrivateJob ? 'Back to Private Jobs' : 'Back to Government Jobs'
  const posterTitle = isPrivateJob ? 'Private Job Poster' : 'Job Poster'
  const bottomApplyCopy = isPrivateJob
    ? `Please visit the company link below to apply for ${job.organization} ${job.title}:`
    : `Please visit the link given below to Apply Online for ${job.organization} ${job.title}:`
  const relatedJobs = allJobs
    .filter(
      (item) =>
        item.id !== job.id &&
        item.type === job.type &&
        (item.category === job.category || item.organization === job.organization)
    )
    .slice(0, 4)
  const provinceText = job.province || (job.location ? String(job.location).split(',')[0].trim() : '-')
  const countryText = job.country || 'In Pakistan'
  const posterImage = job.posterImage || `https://placehold.co/800x1100/eef5ee/1a3f24?text=${encodeURIComponent(
    `${job.organization} Job Poster`
  )}`
  const currentPageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${job.title} - ${job.organization}`
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPageUrl)}`
  const xShare = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentPageUrl)}`
  const emailShare = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(currentPageUrl)}`
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
  const privateHeaderMeta = [
    job.organization,
    `${job.city}, ${provinceText}`,
    job.category,
    job.employmentType || 'Private Job'
  ]
  const privateRoleOverview = job.summary && job.summary !== job.description ? job.summary : job.description

  return (
    <main className="container page-block">
      <Breadcrumbs jobTitle={job.title} parentTo={parentTo} parentLabel={parentLabel} />

      {isPrivateJob ? (
        <article className="job-detail job-detail-private">
          <div className="private-job-hero">
            <div className={`section-kicker private-job-kicker`}>{heroLabel}</div>
            <h1>{job.title}</h1>
            <p className="private-job-summary">{privateRoleOverview}</p>
            <p className="private-job-meta-line">{privateHeaderMeta.join(' | ')}</p>
            <div className="private-job-facts-row">
              <div className="private-job-fact">
                <span>Posted</span>
                <strong>{formatDate(job.postDate)}</strong>
              </div>
              <div className="private-job-fact">
                <span>Deadline</span>
                <strong>{formatDate(job.deadline)}</strong>
              </div>
              <div className="private-job-fact">
                <span>Source</span>
                <strong>{job.source}</strong>
              </div>
            </div>
          </div>

          <div className="private-job-main">
            <div className="private-detail-copy">
              <div className="private-detail-section">
                <h2>Role Overview</h2>
                <p>{job.description}</p>
              </div>

              <div className="private-detail-section">
                <h2>Key Responsibilities</h2>
                <ul>
                  {(job.jobPositions || job.requirements || []).map((req) => (
                    <li key={req}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="private-detail-section">
                <h2>Application Process</h2>
                <p>{job.applyProcedure}</p>
              </div>
            </div>

            <aside className="detail-card detail-card-private private-apply-card">
              <h3>{factsTitle}</h3>
              <div className="private-apply-facts">
                <p><strong>Company</strong><span>{job.organization}</span></p>
                <p><strong>Category</strong><span>{job.category}</span></p>
                <p><strong>Industry</strong><span>{job.industry}</span></p>
                <p><strong>Location</strong><span>{job.city}, {provinceText}</span></p>
                <p><strong>Country</strong><span>{countryText}</span></p>
              </div>

              <div className="detail-actions">
                <a href={job.applyLink} target="_blank" rel="noreferrer" className="action-btn">{applyButtonLabel}</a>
                <Link to={parentTo} className="action-btn secondary">{backButtonLabel}</Link>
              </div>
            </aside>
          </div>
        </article>
      ) : (
        <article className="job-detail">
          <div className="section-kicker">{heroLabel}</div>
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

            <aside className={`detail-card ${isPrivateJob ? 'detail-card-private' : ''}`}>
              <h3>{factsTitle}</h3>
              <p><strong>Posting Date:</strong> {formatDate(job.postDate)}</p>
              <p><strong>Deadline:</strong> {formatDate(job.deadline)}</p>
              <p><strong>Source:</strong> {job.source}</p>
              <p><strong>Category:</strong> {job.category}</p>
              <p><strong>Type of Job:</strong> {job.employmentType || '-'}</p>
              <p><strong>Location:</strong> {job.city}, {provinceText}, {countryText}</p>

              <div className="detail-actions">
                <a href={job.applyLink} target="_blank" rel="noreferrer" className="action-btn">{applyButtonLabel}</a>
                <Link to={parentTo} className="action-btn secondary">{backButtonLabel}</Link>
              </div>
            </aside>
          </div>
        </article>
      )}

      {!isPrivateJob && (
        <>
          <section className="panel">
            <h2 className="panel-title">{posterTitle}</h2>
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
                  <a href={facebookShare} target="_blank" rel="noreferrer" aria-label="Share on Facebook">f</a>
                  <a href={xShare} target="_blank" rel="noreferrer" aria-label="Share on X">X</a>
                  <a href={emailShare} aria-label="Share by Email">@</a>
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
            <p>{bottomApplyCopy}</p>
            <p>
              <a href={job.applyLink} target="_blank" rel="noreferrer">{job.applyLink}</a>
            </p>
          </section>
        </>
      )}

      <section className="panel related-panel">
        <h2 className="panel-title">{isPrivateJob ? 'Similar Private Jobs' : 'Related Jobs'}</h2>
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
