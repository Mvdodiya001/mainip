import axios from "axios";

const baseURL ="http://localhost:8000";

const API = axios.create({
  baseURL,
  withCredentials: true,
});

export default API;