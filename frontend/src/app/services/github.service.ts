import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GitHubToken {
  token: string;
}

export interface RepositoryInfo {
  repository: any;
  branches: any[];
}

export interface CommitsResponse {
  commits: any[];
  total: number;
}

export interface MigrationRequest {
  gitUrl: string;
  fromDate: string;
  toDate: string;
  format: 'pdf' | 'excel';
  includeDetails?: boolean;
}

export interface MigrationResponse {
  success: boolean;
  message: string;
  documentPath: string;
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Initialize GitHub connection
  initializeGitHub(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/init-github`, { token });
  }

  // Get repository information
  getRepositoryInfo(owner: string, repo: string): Observable<RepositoryInfo> {
    return this.http.get<RepositoryInfo>(`${this.apiUrl}/repository/${owner}/${repo}`);
  }

  // Get commits between dates
  getCommits(owner: string, repo: string, fromDate: string, toDate: string, branch: string = 'main'): Observable<CommitsResponse> {
    const params = { fromDate, toDate, branch };
    return this.http.get<CommitsResponse>(`${this.apiUrl}/commits/${owner}/${repo}`, { params });
  }

  // Generate migration document
  generateMigrationDocument(request: MigrationRequest): Observable<MigrationResponse> {
    return this.http.post<MigrationResponse>(`${this.apiUrl}/generate-migration`, request);
  }

  // Download generated document
  downloadDocument(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${filename}`, { responseType: 'blob' });
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  // Parse GitHub URL to extract owner and repo
  parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', '')
      };
    }
    return null;
  }
}