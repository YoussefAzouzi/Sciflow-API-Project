import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchConference,
  fetchConferencePapers,
  Conference,
  Paper,
} from "../api/conferences";
import PapersTable from "../components/PapersTable";

export default function ConferencePage() {
  const { id } = useParams();
  const conferenceId = Number(id);
  const [conference, setConference] = useState<Conference | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conferenceId) return;
    setLoading(true);
    Promise.all([
      fetchConference(conferenceId),
      fetchConferencePapers(conferenceId),
    ])
      .then(([conf, papersData]) => {
        setConference(conf);
        setPapers(papersData);
      })
      .finally(() => setLoading(false));
  }, [conferenceId]);

  if (loading && !conference) {
    return (
      <>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Conference details</div>
          </div>
          <div className="empty-state">Loading…</div>
        </div>
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">Papers</div>
          </div>
          <div className="empty-state">Loading…</div>
        </section>
      </>
    );
  }

  if (!conference) {
    return (
      <>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Conference details</div>
          </div>
          <div className="empty-state">Conference not found.</div>
        </div>
      </>
    );
  }

  const dates =
    conference.start_date && conference.end_date
      ? conference.start_date === conference.end_date
        ? conference.start_date
        : `${conference.start_date} → ${conference.end_date}`
      : conference.start_date || conference.end_date || null;

  return (
    <>
      {/* Left: conference summary */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              {conference.name}
              {conference.acronym && (
                <span className="panel-title-pill">{conference.acronym}</span>
              )}
            </div>
            {conference.series && (
              <p className="panel-description">{conference.series}</p>
            )}
          </div>
        </div>

        {conference.description && (
          <p
            className="panel-description"
            style={{ marginBottom: 10, whiteSpace: "pre-line" }}
          >
            {conference.description}
          </p>
        )}

        <div className="conference-meta">
          {conference.location && (
            <span className="badge badge-location">{conference.location}</span>
          )}
          {dates && <span className="badge">{dates}</span>}
          {conference.publisher && (
            <span className="badge badge-publisher">
              {conference.publisher}
            </span>
          )}
          {typeof conference.rating === "number" && (
            <span className="badge badge-rating">
              Rating {conference.rating.toFixed(1)}
            </span>
          )}
          {typeof conference.credibility === "number" && (
            <span className="badge">
              Credibility {conference.credibility.toFixed(1)}
            </span>
          )}
          {typeof conference.paper_count === "number" && (
            <span className="badge">
              Papers: {conference.paper_count}
            </span>
          )}
        </div>

        {conference.topics && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 4,
                color: "#6b7280",
              }}
            >
              Topics
            </div>
            <div className="chip">{conference.topics}</div>
          </div>
        )}

        {conference.speakers && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 4,
                color: "#6b7280",
              }}
            >
              Keynotes & speakers
            </div>
            <div className="chip">{conference.speakers}</div>
          </div>
        )}

        {conference.colocated_with && (
          <div style={{ marginTop: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 4,
                color: "#6b7280",
              }}
            >
              Co‑located events
            </div>
            <div className="chip">{conference.colocated_with}</div>
          </div>
        )}

        {conference.website && (
          <div style={{ marginTop: 12 }}>
            <a
              href={conference.website}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13 }}
            >
              Visit official website
            </a>
          </div>
        )}

        {/* Events list */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Events & program
          </div>
          {conference.events && conference.events.length > 0 ? (
            <ul className="conferences-list">
              {conference.events.map((ev) => (
                <li key={ev.id} className="conference-item">
                  <div className="conference-name-row">
                    <span className="conference-name">{ev.title}</span>
                    <span className="badge">{ev.type}</span>
                  </div>
                  <div className="conference-meta">
                    {ev.date && <span className="badge">{ev.date}</span>}
                    {ev.time && <span className="badge">{ev.time}</span>}
                    {ev.speakers && (
                      <span className="badge">{ev.speakers}</span>
                    )}
                  </div>
                  {ev.description && (
                    <div className="panel-description" style={{ marginTop: 4 }}>
                      {ev.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              No events registered yet for this conference.
            </div>
          )}
        </div>
      </div>

      {/* Right: papers */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Papers</div>
            <p className="panel-description">
              Automatically imported from the external papers API when
              available.
            </p>
          </div>
        </div>
        <div className="table-wrapper">
          <PapersTable papers={papers} />
        </div>
      </section>
    </>
  );
}
