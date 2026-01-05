import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConference, Conference } from "../api/conferences";

export default function CreateConferencePage() {
  const navigate = useNavigate();
  const [conf, setConf] = useState<Omit<Conference, "id">>({
    name: "",
    acronym: "",
    series: "",
    publisher: "",
    location: "",
    topics: "",
    rating: 0,
    credibility: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conf.name.trim()) return;
    const payload = {
      ...conf,
      rating: Number(conf.rating) || 0,
      credibility: Number(conf.credibility) || 0,
    };
    const created = await createConference(payload);
    navigate(`/conferences/${created.id}`);
  };

  return (
    <section className="panel" style={{ gridColumn: "1 / -1" }}>
      <div className="panel-header">
        <div>
          <div className="panel-title">Create a conference</div>
          <p className="panel-description">
            Add a new scientific conference to Sciflow. You can later attach
            events and Semantic Scholar papers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          placeholder="Name"
          value={conf.name}
          onChange={(e) => setConf((c) => ({ ...c, name: e.target.value }))}
          required
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Acronym (e.g. ICML)"
            value={conf.acronym ?? ""}
            onChange={(e) =>
              setConf((c) => ({ ...c, acronym: e.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Series"
            value={conf.series ?? ""}
            onChange={(e) =>
              setConf((c) => ({ ...c, series: e.target.value }))
            }
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Publisher (ACM, IEEE…)"
            value={conf.publisher ?? ""}
            onChange={(e) =>
              setConf((c) => ({ ...c, publisher: e.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Location"
            value={conf.location ?? ""}
            onChange={(e) =>
              setConf((c) => ({ ...c, location: e.target.value }))
            }
          />
        </div>
        <textarea
          className="input"
          placeholder="Topics (e.g. machine learning, distributed systems…)"
          value={conf.topics ?? ""}
          onChange={(e) =>
            setConf((c) => ({ ...c, topics: e.target.value }))
          }
          rows={3}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            type="number"
            step="0.1"
            placeholder="Rating (0–5)"
            value={conf.rating ?? ""}
            onChange={(e) =>
              setConf((c) => ({ ...c, rating: Number(e.target.value) }))
            }
          />
          <input
            className="input"
            type="number"
            step="0.1"
            placeholder="Credibility (0–5)"
            value={conf.credibility ?? ""}
            onChange={(e) =>
              setConf((c) => ({
                ...c,
                credibility: Number(e.target.value),
              }))
            }
          />
        </div>

        <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
          <button type="submit" className="button">
            Create conference
          </button>
        </div>
      </form>
    </section>
  );
}
