import { HelpService } from "./helper.service";

export class APIService {
  // BASE_URL = 'http://123.31.31.237:6002/api';
  BASE_URL = "https://be.moooc.xyz/";

  constructor(private helpService: HelpService) { }

  async handleResponse(response: any) {
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 400) {
        this.helpService.errorMessage(
          error.message || "Hệ thống bị gián đoạn vui lòng quay lại sau."
        );
      } else {
        this.helpService.errorMessage(
          "Hệ thống bị gián đoạn vui lòng quay lại sau."
        );
      }
    }
    return response.json();
  }

  async getMethod(endPoint: string) {
    const response = await fetch(`${this.BASE_URL}${endPoint}`);
    return this.handleResponse(response);
  }

  async postMethod(endPoint: string, itemData: any) {
    const response = await fetch(`${this.BASE_URL}${endPoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: itemData ? JSON.stringify(itemData) : null,
    });
    return this.handleResponse(response);
  }

  async putMethod(endPoint: string, itemData: any) {
    const response = await fetch(`${this.BASE_URL}${endPoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: itemData ? JSON.stringify(itemData) : null,
    });
    return this.handleResponse(response);
  }

  async deleteMethod(endPoint: string, itemData: any) {
    const response = await fetch(`${this.BASE_URL}${endPoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: itemData ? JSON.stringify(itemData) : null,
    });
    return this.handleResponse(response);
  }
}
