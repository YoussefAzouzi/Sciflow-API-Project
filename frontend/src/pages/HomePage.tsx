import ConferenceList from "../components/ConferenceList";
import PapersTable from "../components/PapersTable";
import { useEffect, useState } from "react";
import { fetchConferencePapers, Paper } from "../api/conferences";

export default function HomePage() {
  const [featuredPapers, setFeaturedPapers] = useState<Paper[]>([]);

  useEffect(() => {
    fetchConferencePapers(1)
      .then(setFeaturedPapers)
      .catch(() => setFeaturedPapers([]));
  }, []);

  return (
    <>
      <ConferenceList />
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Featured papers</div>
            <p className="panel-description">
              Semantic Scholar metadata and PDF links for one selected
              conference.
            </p>
          </div>
          <div className="chip">
            <span>Source</span>
            <span>Semantic Scholar</span>
          </div>
        </div>
        <div className="table-wrapper">
          <PapersTable papers={featuredPapers} />
        </div>
      </section>
    </>
  );
}
