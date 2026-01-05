import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchConferences, Conference } from "../api/conferences";

type SortOption = "name" | "rating_desc";

export default function ConferenceList() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("rating_desc");
  const [filterPublisher, setFilterPublisher] = useState<string>("");
  const [filterMinRating, setFilterMinRating] = useState<string>("");
  const [filterMinCred, setFilterMinCred] = useState<string>("");

  async function loadConferences() {
    const min_rating =
      filterMinRating.trim() === "" ? undefined : Number(filterMinRating);
    const min_cred =
      filterMinCred.trim() === "" ? undefined : Number(filterMinCred);

    const data = await fetchConferences({
      publisher: filterPublisher || undefined,
      min_rating: min_rating,
      min_credibility: min_cred,
    });

    let sorted = [...data];
    if (sortBy === "rating_desc") {
      sorted.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name)
      );
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    setConferences(sorted);
  }

  useEffect(() => {
    loadConferences().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = () => {
    loadConferences().catch(console.error);
  };

  const formatDates = (start?: string | null, end?: string | null) => {
    if (!start && !end) return "";
    if (start && end && start !== end) return `${start} → ${end}`;
    return start || end || "";
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            Conferences
            <span className="panel-title-pill">Browse & filter</span>
          </div>
          <p className="panel-description">
            Explore scientific conferences and click one to see full details,
            events, and papers.
          </p>
        </div>
      </div>

      <div className="controls-row">
        <input
          className="input"
          placeholder="Filter by publisher"
          value={filterPublisher}
          onChange={(e) => setFilterPublisher(e.target.value)}
        />
        <input
          className="input"
          type="number"
          placeholder="Min rating"
          value={filterMinRating}
          onChange={(e) => setFilterMinRating(e.target.value)}
          style={{ maxWidth: 110 }}
        />
        <input
          className="input"
          type="number"
          placeholder="Min cred."
          value={filterMinCred}
          onChange={(e) => setFilterMinCred(e.target.value)}
          style={{ maxWidth: 110 }}
        />
        <select
          className="select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="rating_desc">Sort: rating high → low</option>
          <option value="name">Sort: name A → Z</option>
        </select>
        <button
          type="button"
          className="button-secondary button"
          onClick={handleApplyFilters}
        >
          Apply
        </button>
      </div>

      {conferences.length === 0 ? (
        <div className="empty-state">
          No conferences match the current filters. Use “Create conference” in
          the header to add one.
        </div>
      ) : (
        <ul className="conferences-list">
          {conferences.map((c) => (
            <li key={c.id} className="conference-item">
              <Link to={`/conferences/${c.id}`} className="conference-link">
                <div className="conference-name-row">
                  <span className="conference-name">{c.name}</span>
                  {typeof c.rating === "number" && (
                    <span className="badge badge-rating">
                      Rating {c.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                {c.series && (
                  <div className="panel-description" style={{ marginTop: 2 }}>
                    {c.series}
                  </div>
                )}
                <div className="conference-meta">
                  {c.publisher && (
                    <span className="badge badge-publisher">
                      {c.publisher}
                    </span>
                  )}
                  {c.location && (
                    <span className="badge badge-location">{c.location}</span>
                  )}
                  {formatDates(c.start_date, c.end_date) && (
                    <span className="badge">
                      {formatDates(c.start_date, c.end_date)}
                    </span>
                  )}
                  {typeof c.credibility === "number" && (
                    <span className="badge">
                      Credibility {c.credibility.toFixed(1)}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
