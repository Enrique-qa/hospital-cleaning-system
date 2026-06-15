import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const api = axios.create({
  baseURL: configuredApiUrl
    ? configuredApiUrl.replace(/\/+$/, "")
    : `http://${window.location.hostname}:3333`,
  timeout: 8000,
});

export const API_BASE_URL = String(api.defaults.baseURL);
