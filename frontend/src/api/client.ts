import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8000", // or http://localhost:8000
});

export default client;
