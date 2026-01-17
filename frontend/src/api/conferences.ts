import api from "../services/api";

export interface Conference {
    id: number;
    name: string;
    acronym?: string;
    series?: string;
    publisher?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    topics?: string;
    description?: string;
    speakers?: string;
    website?: string;
    colocated_with?: string[];
    rating?: number;
    credibility?: number;
    source?: string;
}

export async function fetchConferences(params?: {
    publisher?: string;
    min_rating?: number;
    min_credibility?: number;
}): Promise<Conference[]> {
    const response = await api.get("/conferences", { params });
    return response.data;
}

export async function getConference(id: number): Promise<Conference> {
    const response = await api.get(`/conferences/${id}`);
    return response.data;
}

export async function createConference(data: Partial<Conference>): Promise<Conference> {
    const response = await api.post("/conferences", data);
    return response.data;
}

export async function updateConference(id: number, data: Partial<Conference>): Promise<Conference> {
    const response = await api.put(`/conferences/${id}`, data);
    return response.data;
}

export async function deleteConference(id: number): Promise<void> {
    await api.delete(`/conferences/${id}`);
}
