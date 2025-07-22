import { Octokit } from '@octokit/rest';
import { createTokenAuth } from '@octokit/auth-token';
import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import chalk from 'chalk';
import { ReportGenerator } from './ReportGenerator.js';
import { AngularAnalyzer } from './AngularAnalyzer.js';

export class GitHubMigrationTool {
  constructor(config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
      authStrategy: createTokenAuth
    });
    this.reportGenerator = new ReportGenerator(config);
    this.angularAnalyzer = new AngularAnalyzer(config);
  }

  async generateMigrationReport() {
    console.log(chalk.blue('🔍 Fetching repository information...'));
    
    const repoInfo = await this.getRepositoryInfo();
    const branches = await this.getBranches();
    const commits = await this.getCommitsInDateRange();
    const fileChanges = await this.getFileChanges(commits);
    
    console.log(chalk.blue('📊 Analyzing Angular-specific changes...'));
    const angularChanges = await this.angularAnalyzer.analyzeChanges(fileChanges);
    
    console.log(chalk.blue('📝 Generating reports...'));
    const report = {
      metadata: {
        repository: repoInfo,
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: this.config.fromDate,
          to: this.config.toDate
        },
        branches: this.config.branches,
        tool: 'GitHub Migration Documentation Tool v1.0.0'
      },
      summary: {
        totalCommits: commits.length,
        filesChanged: fileChanges.length,
        branchesAnalyzed: branches.length,
        dateRange: {
          from: this.config.fromDate,
          to: this.config.toDate
        }
      },
      commits,
      fileChanges,
      branches,
      angular: angularChanges
    };

    await this.reportGenerator.generateReports(report);
    
    return report;
  }

  async getRepositoryInfo() {
    try {
      const { data: repo } = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });

      return {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
        language: repo.language,
        size: repo.size,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error.message}`);
    }
  }

  async getBranches() {
    try {
      const allBranches = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data: branches } = await this.octokit.repos.listBranches({
          owner: this.config.owner,
          repo: this.config.repo,
          per_page: 100,
          page
        });

        allBranches.push(...branches);
        hasMore = branches.length === 100;
        page++;
      }

      // Filter branches based on configuration
      const targetBranches = this.config.branches;
      const filteredBranches = allBranches.filter(branch => 
        targetBranches.includes(branch.name)
      );

      return filteredBranches.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        url: branch.commit.url,
        protected: branch.protected
      }));
    } catch (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
  }

  async getCommitsInDateRange() {
    console.log(chalk.blue(`📅 Fetching commits from ${this.config.fromDate} to ${this.config.toDate}...`));
    
    const allCommits = [];
    
    for (const branchName of this.config.branches) {
      console.log(chalk.gray(`  • Processing branch: ${branchName}`));
      
      try {
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const { data: commits } = await this.octokit.repos.listCommits({
            owner: this.config.owner,
            repo: this.config.repo,
            sha: branchName,
            since: moment(this.config.fromDate).toISOString(),
            until: moment(this.config.toDate).endOf('day').toISOString(),
            per_page: 100,
            page
          });

          const formattedCommits = commits.map(commit => ({
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
            branch: branchName,
            stats: {
              additions: commit.stats?.additions || 0,
              deletions: commit.stats?.deletions || 0,
              total: commit.stats?.total || 0
            }
          }));

          allCommits.push(...formattedCommits);
          hasMore = commits.length === 100;
          page++;
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Warning: Could not fetch commits for branch ${branchName}: ${error.message}`));
      }
    }

    return allCommits.sort((a, b) => new Date(b.author.date) - new Date(a.author.date));
  }

  async getFileChanges(commits) {
    console.log(chalk.blue('📁 Analyzing file changes...'));
    
    const fileChanges = [];
    const processedCommits = new Set();

    for (const commit of commits) {
      if (processedCommits.has(commit.sha)) continue;
      processedCommits.add(commit.sha);

      try {
        const { data: commitDetails } = await this.octokit.repos.getCommit({
          owner: this.config.owner,
          repo: this.config.repo,
          ref: commit.sha
        });

        for (const file of commitDetails.files || []) {
          fileChanges.push({
            filename: file.filename,
            status: file.status, // added, modified, removed, renamed
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            patch: file.patch,
            sha: commit.sha,
            commitMessage: commit.message,
            author: commit.author,
            date: commit.author.date,
            branch: commit.branch,
            url: file.blob_url
          });
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Warning: Could not fetch file changes for commit ${commit.sha}: ${error.message}`));
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return fileChanges;
  }

  async getFileContent(filename, ref = null) {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filename,
        ref: ref || this.config.branches[0]
      });

      if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (error) {
      if (error.status === 404) {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  async compareFiles(filename, fromRef, toRef) {
    try {
      const { data: comparison } = await this.octokit.repos.compareCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        base: fromRef,
        head: toRef
      });

      const fileChange = comparison.files?.find(file => file.filename === filename);
      return fileChange || null;
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Warning: Could not compare file ${filename}: ${error.message}`));
      return null;
    }
  }
}
