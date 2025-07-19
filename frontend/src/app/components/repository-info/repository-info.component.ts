import { Component, Input, OnInit } from '@angular/core';
import { GitHubService } from '../../services/github.service';

@Component({
  selector: 'app-repository-info',
  templateUrl: './repository-info.component.html',
  styleUrls: ['./repository-info.component.scss']
})
export class RepositoryInfoComponent implements OnInit {
  @Input() gitUrl: string = '';

  repositoryInfo: any = null;
  isLoading = false;
  error: string = '';

  constructor(private githubService: GitHubService) {}

  ngOnInit(): void {
    if (this.gitUrl) {
      this.loadRepositoryInfo();
    }
  }

  async loadRepositoryInfo(): Promise<void> {
    if (!this.gitUrl) return;

    this.isLoading = true;
    this.error = '';

    try {
      const urlInfo = this.githubService.parseGitHubUrl(this.gitUrl);
      if (!urlInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      const response = await this.githubService.getRepositoryInfo(urlInfo.owner, urlInfo.repo).toPromise();
      this.repositoryInfo = response;
    } catch (error: any) {
      this.error = error.error?.details || error.message || 'Failed to load repository information';
    } finally {
      this.isLoading = false;
    }
  }

  getRepositoryStats(): any {
    if (!this.repositoryInfo?.repository) return null;

    const repo = this.repositoryInfo.repository;
    return {
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      issues: repo.open_issues_count || 0,
      language: repo.language || 'Not specified',
      size: this.formatSize(repo.size || 0),
      lastUpdated: new Date(repo.updated_at).toLocaleDateString()
    };
  }

  private formatSize(sizeInKB: number): string {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    }
  }

  getBranchCount(): number {
    return this.repositoryInfo?.branches?.length || 0;
  }

  getDefaultBranch(): string {
    return this.repositoryInfo?.repository?.default_branch || 'main';
  }
}