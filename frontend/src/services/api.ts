import axios from "axios";

export const API_BASE_URL = "http://localhost:3333"; //"http://192.168.2.187:3333" para mobile

export const api = axios.create({
  baseURL: API_BASE_URL,
});