import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchConferences, Conference } from "../api/conferences";
import { motion } from "framer-motion";

type SortOption = "name" | "rating_desc";

export default function ConferenceList() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("rating_desc");
  const [filterPublisher, setFilterPublisher] = useState<string>("");
  const [filterMinRating, setFilterMinRating] = useState<string>("");

  async function loadConferences() {
    const min_rating =
      filterMinRating.trim() === "" ? undefined : Number(filterMinRating);

    const data = await fetchConferences({
      publisher: filterPublisher || undefined,
      min_rating: min_rating,
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
  }, []);

  const handleApplyFilters = () => {
    loadConferences().catch(console.error);
  };

  const sciflowConferences = conferences.filter((c) => c.source !== "dev.events");
  const devEventsConferences = conferences.filter((c) => c.source === "dev.events");

  const renderList = (list: Conference[], isExternal: boolean) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {list.map((c) => (
        <motion.div key={c.id} whileHover={{ x: 5 }} className="card" style={{ padding: '16px 20px' }}>
          <Link to={`/conferences/${c.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>{c.name}</span>
                {c.acronym && <span className="badge">{c.acronym}</span>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                {c.location && <span>📍 {c.location}</span>}
                {c.publisher && <span>🏢 {c.publisher}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {typeof c.rating === "number" && (
                <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '15px' }}>⭐ {c.rating.toFixed(1)}</div>
              )}
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{isExternal ? 'External' : 'Sciflow'}</div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: '32px', background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Refine Results</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>Publisher</label>
            <input placeholder="Filter by publisher..." value={filterPublisher} onChange={e => setFilterPublisher(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, width: '120px' }}>
            <label>Min Rating</label>
            <input type="number" value={filterMinRating} onChange={e => setFilterMinRating(e.target.value)} placeholder="0-5" />
          </div>
          <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
            <label>Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
              <option value="rating_desc">Rating (High-Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
          <button onClick={handleApplyFilters} className="btn btn-primary" style={{ height: '48px' }}>Apply Filters</button>
        </div>
      </div>

      {conferences.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No matches found for your criteria.</p>
        </div>
      ) : (
        <>
          {sciflowConferences.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)' }}>Sciflow Exclusive</h3>
              {renderList(sciflowConferences, false)}
            </div>
          )}
          {devEventsConferences.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)' }}>Global Feed</h3>
              {renderList(devEventsConferences, true)}
            </div>
          )}
        </>
      )}
    </div>
  );
}