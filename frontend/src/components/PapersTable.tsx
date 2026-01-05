import { Paper } from "../api/conferences";

interface Props {
  papers: Paper[];
}

export default function PapersTable({ papers }: Props) {
  if (!papers.length) {
    return (
      <div className="empty-state">
        No papers imported yet. Use
        {" "}
        <code>/conferences/{`{id}`}/papers/import</code>
        {" "}
        in the API to pull them from Semantic Scholar.
      </div>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Venue</th>
          <th>Year</th>
          <th>Citations</th>
          <th>PDF</th>
        </tr>
      </thead>
      <tbody>
        {papers.map((p) => (
          <tr key={p.id}>
            <td>{p.title}</td>
            <td>{p.venue}</td>
            <td>{p.year}</td>
            <td>{p.citation_count}</td>
            <td>
              {p.open_access_pdf_url ? (
                <a
                  href={p.open_access_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  PDF
                </a>
              ) : (
                "N/A"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
