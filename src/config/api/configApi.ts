import axios from "axios";
import { HelpService } from "../../service/helper.service";
import { routesConfig } from "../routes";
import { useAuthStore } from "../../stores/stores";
export const BASE_URL = process.env.REACT_APP_BASE_API_URL?.replaceAll('"', "");
const helpService = new HelpService();
export const axiosConfig = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosConfigUpload = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    "Content-Type": "multipart/form-data",
    ...(localStorage.getItem("schoolManagement")
      ? { "x-enterprise-uuid": localStorage.getItem("schoolManagement") }
      : {}),
  },
});

axiosConfig.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!config.headers["Authorization"] || accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const enterpriseUuid = localStorage.getItem("schoolManagement");
    if (enterpriseUuid) {
      config.headers["x-enterprise-uuid"] = enterpriseUuid;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
const currentUrl = new URL(window.location.href);

axiosConfig.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    const prevRequest = error?.config;
    if (error?.response?.status === 403 && !prevRequest?.sent) {
      prevRequest.sent = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const accessToken = useAuthStore.getState().accessToken;
        if (refreshToken && accessToken) {
          prevRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return axiosConfig(prevRequest);
        }
      } catch (error) {}
    } else if (
      error?.response?.status === 401 ||
      error?.response?.status === 503
    ) {
      const logout = useAuthStore.getState().logout;
      logout();
    } else if (error?.response?.status === 502) {
    } else {
      helpService.showMessageErrorAPI(error);
    }
    return Promise.reject(error);
  }
);
