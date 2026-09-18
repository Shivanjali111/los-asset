/**
 * DASHBOARD BANNER: Dashboard passes brand, branch, summary, snapshot and configured content.
 * summary supplies the SLA duration; snapshot supplies counts; content supplies copy and journey stages.
 * BrandLogo uses the tenant asset even in the decorative artwork.
 * Fragment groups a stage and its separator without adding an extra HTML wrapper.
 */
import { Fragment } from "react";
import BrandLogo from "../../../shared/components/BrandLogo/BrandLogo";

export default function DashboardHero({
  brand,
  branch,
  summary,
  snapshot,
  content,
}) {
  return (
    <section className="gold-dashboard-hero">
      <div className="gold-hero-copy">
        <span className="gold-hero-kicker">
          <i aria-hidden="true" />
          {branch.name} | Live Operations
        </span>
        <h2>
          {content.title} <em>{summary.slaMinutes} minutes or less.</em>
        </h2>
        <p>{content.description}</p>
        <div
          className="gold-journey-strip"
          aria-label="Gold loan processing stages"
        >
          {content.stages.map((stage, index) => (
            <Fragment key={stage.id}>
              {index > 0 && <i aria-hidden="true" />}
              <span className={index === 0 ? "active" : ""}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {stage.label}
              </span>
            </Fragment>
          ))}
        </div>
      </div>
      <div className="gold-hero-snapshot">
        <div className="snapshot-title">
          <span>Branch snapshot</span>
          <small>Live operational focus</small>
        </div>
        {snapshot.map((item) => (
          <div key={item.id} className={`snapshot-metric ${item.tone}`}>
            <strong>{String(item.value).padStart(2, "0")}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="gold-hero-art" aria-hidden="true">
        <span className="hero-gold-ring hero-ring-large" />
        <span className="hero-gold-ring hero-ring-small" />
        <span className="hero-gold-coin hero-coin-one">916</span>
        <span className="hero-gold-coin hero-coin-two">24K</span>
        <BrandLogo brand={brand} compact decorative />
        <b>*</b>
      </div>
    </section>
  );
}
