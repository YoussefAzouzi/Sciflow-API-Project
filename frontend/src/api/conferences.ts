import client from "./client";

export interface Event {
  id: number;
  title: string;
  type: string;
  date?: string | null;
  time?: string | null;
  speakers?: string | null;
  description?: string | null;
  parent_event_id?: number | null;
}

export interface Conference {
  id: number;
  name: string;
  acronym?: string | null;
  series?: string | null;
  publisher?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  topics?: string | null;
  description?: string | null;
  speakers?: string | null;
  website?: string | null;
  rating?: number | null;
  credibility?: number | null;
  colocated_with?: string | null;
  events?: Event[];
  paper_count?: number;
}

export interface Paper {
  id: number;
  conference_id: number;
  event_id?: number | null;
  title?: string | null;
  abstract?: string | null;
  venue?: string | null;
  year?: number | null;
  citation_count?: number | null;
  open_access_pdf_url?: string | null;
  fields_of_study?: string | null;
}

export async function fetchConferences(params?: {
  publisher?: string;
  min_rating?: number;
  min_credibility?: number;
}): Promise<Conference[]> {
  const res = await client.get<Conference[]>("/conferences", {
    params: {
      publisher: params?.publisher,
      min_rating: params?.min_rating,
      min_credibility: params?.min_credibility,
    },
  });
  return res.data;
}

export async function createConference(
  data: Omit<Conference, "id" | "events" | "paper_count">
): Promise<Conference> {
  const res = await client.post<Conference>("/conferences", data);
  return res.data;
}

export async function fetchConference(id: number): Promise<Conference> {
  const res = await client.get<Conference>(`/conferences/${id}`);
  return res.data;
}

export async function fetchConferencePapers(id: number): Promise<Paper[]> {
  const res = await client.get<Paper[]>(`/conferences/${id}/papers`);
  return res.data;
}
