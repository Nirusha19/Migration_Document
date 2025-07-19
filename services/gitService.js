const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;

class GitService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  parseGitHubUrl(gitUrl) {
    const regex = /github\.com[\/:]([^\/]+)\/([^\/\.]+)/;
    const match = gitUrl.match(regex);
    
    if (!match) {
      throw new Error('Invalid GitHub URL format');
    }

    return {
      owner: match[1],
      repo: match[2]
    };
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(gitUrl) {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      const { data: branches } = await this.octokit.rest.repos.listBranches({
        owner,
        repo
      });

      return {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        defaultBranch: repoData.default_branch,
        language: repoData.language,
        size: repoData.size,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        branches: branches.map(branch => ({
          name: branch.name,
          sha: branch.commit.sha,
          protected: branch.protected
        })),
        cloneUrl: repoData.clone_url,
        sshUrl: repoData.ssh_url,
        private: repoData.private,
        stargazers: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error.message}`);
    }
  }

  /**
   * Get commits between date range
   */
  async getCommitHistory(gitUrl, fromDate, toDate, branch = 'main') {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const commits = await this.octokit.paginate(this.octokit.rest.repos.listCommits, {
        owner,
        repo,
        sha: branch,
        since: moment(fromDate).toISOString(),
        until: moment(toDate).toISOString(),
        per_page: 100
      });

      return commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        },
        url: commit.html_url,
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0,
        changedFiles: commit.files?.length || 0
      }));
    } catch (error) {
      throw new Error(`Failed to fetch commit history: ${error.message}`);
    }
  }

  /**
   * Get pull requests in date range
   */
  async getPullRequests(gitUrl, fromDate, toDate, state = 'all') {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const pullRequests = await this.octokit.paginate(this.octokit.rest.pulls.list, {
        owner,
        repo,
        state,
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      });

      // Filter by date range
      const filteredPRs = pullRequests.filter(pr => {
        const updatedAt = moment(pr.updated_at);
        return updatedAt.isBetween(moment(fromDate), moment(toDate), null, '[]');
      });

      return filteredPRs.map(pr => ({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        author: pr.user.login,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        closedAt: pr.closed_at,
        mergedAt: pr.merged_at,
        baseBranch: pr.base.ref,
        headBranch: pr.head.ref,
        url: pr.html_url,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files,
        labels: pr.labels.map(label => label.name)
      }));
    } catch (error) {
      throw new Error(`Failed to fetch pull requests: ${error.message}`);
    }
  }

  /**
   * Get issues in date range
   */
  async getIssues(gitUrl, fromDate, toDate, state = 'all') {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const issues = await this.octokit.paginate(this.octokit.rest.issues.listForRepo, {
        owner,
        repo,
        state,
        sort: 'updated',
        direction: 'desc',
        since: moment(fromDate).toISOString(),
        per_page: 100
      });

      // Filter out pull requests (GitHub API includes PRs in issues)
      const filteredIssues = issues.filter(issue => !issue.pull_request);

      return filteredIssues.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        author: issue.user.login,
        assignees: issue.assignees.map(assignee => assignee.login),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        url: issue.html_url,
        labels: issue.labels.map(label => label.name)
      }));
    } catch (error) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * Get releases in date range
   */
  async getReleases(gitUrl, fromDate, toDate) {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const releases = await this.octokit.paginate(this.octokit.rest.repos.listReleases, {
        owner,
        repo,
        per_page: 100
      });

      // Filter by date range
      const filteredReleases = releases.filter(release => {
        const publishedAt = moment(release.published_at);
        return publishedAt.isBetween(moment(fromDate), moment(toDate), null, '[]');
      });

      return filteredReleases.map(release => ({
        id: release.id,
        tagName: release.tag_name,
        name: release.name,
        body: release.body,
        author: release.author?.login,
        createdAt: release.created_at,
        publishedAt: release.published_at,
        draft: release.draft,
        prerelease: release.prerelease,
        url: release.html_url,
        assets: release.assets.map(asset => ({
          name: asset.name,
          size: asset.size,
          downloadCount: asset.download_count,
          downloadUrl: asset.browser_download_url
        }))
      }));
    } catch (error) {
      throw new Error(`Failed to fetch releases: ${error.message}`);
    }
  }

  /**
   * Get contributors statistics
   */
  async getContributors(gitUrl) {
    try {
      const { owner, repo } = this.parseGitHubUrl(gitUrl);
      
      const { data: contributors } = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 100
      });

      return contributors.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions,
        type: contributor.type,
        url: contributor.html_url,
        avatarUrl: contributor.avatar_url
      }));
    } catch (error) {
      throw new Error(`Failed to fetch contributors: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive migration data
   */
  async generateMigrationData(gitUrl, fromDate, toDate, selectedBranch = 'main') {
    try {
      console.log(`Generating migration data for ${gitUrl} from ${fromDate} to ${toDate}`);
      
      const [
        repoInfo,
        commits,
        pullRequests,
        issues,
        releases,
        contributors
      ] = await Promise.all([
        this.getRepositoryInfo(gitUrl),
        this.getCommitHistory(gitUrl, fromDate, toDate, selectedBranch),
        this.getPullRequests(gitUrl, fromDate, toDate),
        this.getIssues(gitUrl, fromDate, toDate),
        this.getReleases(gitUrl, fromDate, toDate),
        this.getContributors(gitUrl)
      ]);

      // Calculate statistics
      const stats = {
        totalCommits: commits.length,
        totalPullRequests: pullRequests.length,
        totalIssues: issues.length,
        totalReleases: releases.length,
        totalContributors: contributors.length,
        linesAdded: commits.reduce((sum, commit) => sum + commit.additions, 0),
        linesDeleted: commits.reduce((sum, commit) => sum + commit.deletions, 0),
        filesChanged: commits.reduce((sum, commit) => sum + commit.changedFiles, 0),
        activeContributors: [...new Set(commits.map(commit => commit.author.email))].length,
        mergedPRs: pullRequests.filter(pr => pr.state === 'closed' && pr.mergedAt).length,
        openIssues: issues.filter(issue => issue.state === 'open').length,
        closedIssues: issues.filter(issue => issue.state === 'closed').length
      };

      return {
        metadata: {
          gitUrl,
          fromDate,
          toDate,
          selectedBranch,
          generatedAt: moment().toISOString(),
          timeRange: moment(toDate).diff(moment(fromDate), 'days') + ' days'
        },
        repository: repoInfo,
        statistics: stats,
        commits,
        pullRequests,
        issues,
        releases,
        contributors
      };
    } catch (error) {
      throw new Error(`Failed to generate migration data: ${error.message}`);
    }
  }
}

module.exports = new GitService();