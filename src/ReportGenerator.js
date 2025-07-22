import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import chalk from 'chalk';
import { Parser } from 'json2csv';

export class ReportGenerator {
  constructor(config) {
    this.config = config;
    this.outputDir = config.outputDir;
  }

  async generateReports(reportData) {
    // Ensure output directory exists
    await fs.ensureDir(this.outputDir);

    const promises = [];

    if (this.config.outputFormats.includes('markdown')) {
      promises.push(this.generateMarkdownReport(reportData));
    }

    if (this.config.outputFormats.includes('csv')) {
      promises.push(this.generateCSVReport(reportData));
    }

    if (this.config.outputFormats.includes('json')) {
      promises.push(this.generateJSONReport(reportData));
    }

    await Promise.all(promises);
    
    console.log(chalk.green(`📁 Reports generated in: ${this.outputDir}`));
  }

  async generateMarkdownReport(reportData) {
    const timestamp = moment().format('YYYY-MM-DD-HHmmss');
    
    // Main summary report
    const summaryReport = this.generateSummaryMarkdown(reportData);
    await fs.writeFile(
      path.join(this.outputDir, `migration-summary-${timestamp}.md`),
      summaryReport
    );

    // Detailed changes report
    const detailedReport = this.generateDetailedMarkdown(reportData);
    await fs.writeFile(
      path.join(this.outputDir, `detailed-changes-${timestamp}.md`),
      detailedReport
    );

    // Angular-specific report
    if (reportData.angular) {
      const angularReport = this.generateAngularMarkdown(reportData.angular);
      await fs.writeFile(
        path.join(this.outputDir, `angular-migration-${timestamp}.md`),
        angularReport
      );
    }

    // Branch-specific reports
    await fs.ensureDir(path.join(this.outputDir, 'branches'));
    for (const branch of this.config.branches) {
      const branchReport = this.generateBranchMarkdown(reportData, branch);
      await fs.writeFile(
        path.join(this.outputDir, 'branches', `${branch}-changes-${timestamp}.md`),
        branchReport
      );
    }
  }

  generateSummaryMarkdown(reportData) {
    const { metadata, summary, branches } = reportData;
    
    let md = `# Migration Summary Report\n\n`;
    md += `**Repository:** ${metadata.repository.fullName}\n`;
    md += `**Generated:** ${moment(metadata.generatedAt).format('YYYY-MM-DD HH:mm:ss')}\n`;
    md += `**Date Range:** ${metadata.dateRange.from} to ${metadata.dateRange.to}\n`;
    md += `**Tool:** ${metadata.tool}\n\n`;

    md += `## Repository Information\n\n`;
    md += `- **Name:** ${metadata.repository.name}\n`;
    md += `- **Description:** ${metadata.repository.description || 'N/A'}\n`;
    md += `- **URL:** ${metadata.repository.url}\n`;
    md += `- **Default Branch:** ${metadata.repository.defaultBranch}\n`;
    md += `- **Primary Language:** ${metadata.repository.language || 'N/A'}\n`;
    md += `- **Repository Size:** ${metadata.repository.size} KB\n`;
    md += `- **Created:** ${moment(metadata.repository.createdAt).format('YYYY-MM-DD')}\n`;
    md += `- **Last Updated:** ${moment(metadata.repository.updatedAt).format('YYYY-MM-DD')}\n\n`;

    md += `## Analysis Summary\n\n`;
    md += `- **Total Commits Analyzed:** ${summary.totalCommits}\n`;
    md += `- **Total Files Changed:** ${summary.filesChanged}\n`;
    md += `- **Branches Analyzed:** ${summary.branchesAnalyzed}\n\n`;

    md += `## Branches\n\n`;
    branches.forEach(branch => {
      md += `### ${branch.name}\n`;
      md += `- **SHA:** \`${branch.sha}\`\n`;
      md += `- **Protected:** ${branch.protected ? 'Yes' : 'No'}\n\n`;
    });

    if (reportData.angular) {
      md += `## Angular Migration Overview\n\n`;
      md += `- **Package.json Updates:** ${reportData.angular.packageUpdates}\n`;
      md += `- **Configuration Changes:** ${reportData.angular.configChanges}\n`;
      md += `- **TypeScript Config Updates:** ${reportData.angular.tsConfigChanges}\n`;
      md += `- **Component Changes:** ${reportData.angular.componentChanges}\n`;
      md += `- **Service Changes:** ${reportData.angular.serviceChanges}\n`;
      md += `- **Module Changes:** ${reportData.angular.moduleChanges}\n\n`;

      if (reportData.angular.migrationPatterns?.length > 0) {
        md += `### Detected Migration Patterns\n\n`;
        reportData.angular.migrationPatterns.forEach(pattern => {
          md += `- ${pattern}\n`;
        });
        md += `\n`;
      }
    }

    return md;
  }

  generateDetailedMarkdown(reportData) {
    let md = `# Detailed Changes Report\n\n`;
    md += `**Generated:** ${moment().format('YYYY-MM-DD HH:mm:ss')}\n\n`;

    // Group changes by file
    const fileGroups = {};
    reportData.fileChanges.forEach(change => {
      if (!fileGroups[change.filename]) {
        fileGroups[change.filename] = [];
      }
      fileGroups[change.filename].push(change);
    });

    md += `## Files Changed (${Object.keys(fileGroups).length})\n\n`;

    Object.entries(fileGroups).forEach(([filename, changes]) => {
      md += `### ${filename}\n\n`;
      md += `**Total Changes:** ${changes.length}\n\n`;

      changes.forEach(change => {
        md += `#### ${moment(change.date).format('YYYY-MM-DD HH:mm')} - ${change.status}\n\n`;
        md += `- **Commit:** [\`${change.sha.substring(0, 8)}\`](${change.url})\n`;
        md += `- **Author:** ${change.author.name} (${change.author.email})\n`;
        md += `- **Branch:** ${change.branch}\n`;
        md += `- **Message:** ${change.commitMessage.split('\n')[0]}\n`;
        md += `- **Changes:** +${change.additions} -${change.deletions}\n\n`;

        if (change.patch && change.patch.length < 2000) {
          md += `**Patch:**\n\`\`\`diff\n${change.patch}\n\`\`\`\n\n`;
        }
      });
    });

    return md;
  }

  generateAngularMarkdown(angularData) {
    let md = `# Angular Migration Report\n\n`;
    md += `**Generated:** ${moment().format('YYYY-MM-DD HH:mm:ss')}\n\n`;

    md += `## Summary\n\n`;
    md += `- **Package.json Updates:** ${angularData.packageUpdates}\n`;
    md += `- **Angular.json Changes:** ${angularData.configChanges}\n`;
    md += `- **TypeScript Config Updates:** ${angularData.tsConfigChanges}\n`;
    md += `- **Component Changes:** ${angularData.componentChanges}\n`;
    md += `- **Service Changes:** ${angularData.serviceChanges}\n`;
    md += `- **Module Changes:** ${angularData.moduleChanges}\n\n`;

    if (angularData.migrationPatterns?.length > 0) {
      md += `## Detected Migration Patterns\n\n`;
      angularData.migrationPatterns.forEach(pattern => {
        md += `- ${pattern}\n`;
      });
      md += `\n`;
    }

    if (angularData.dependencies.added.length > 0) {
      md += `## Dependencies Added\n\n`;
      md += `| Package | Version | Date | Commit |\n`;
      md += `|---------|---------|------|--------|\n`;
      angularData.dependencies.added.forEach(dep => {
        md += `| ${dep.package} | ${dep.version} | ${moment(dep.date).format('YYYY-MM-DD')} | \`${dep.commit.substring(0, 8)}\` |\n`;
      });
      md += `\n`;
    }

    if (angularData.dependencies.removed.length > 0) {
      md += `## Dependencies Removed\n\n`;
      md += `| Package | Version | Date | Commit |\n`;
      md += `|---------|---------|------|--------|\n`;
      angularData.dependencies.removed.forEach(dep => {
        md += `| ${dep.package} | ${dep.version} | ${moment(dep.date).format('YYYY-MM-DD')} | \`${dep.commit.substring(0, 8)}\` |\n`;
      });
      md += `\n`;
    }

    if (angularData.migrationSteps?.length > 0) {
      md += `## Migration Steps\n\n`;
      angularData.migrationSteps.forEach(step => {
        md += `### Step ${step.step}: ${step.title}\n\n`;
        md += `${step.description}\n\n`;
        if (step.commands.length > 0) {
          md += `**Commands:**\n`;
          step.commands.forEach(cmd => {
            md += `\`\`\`bash\n${cmd}\n\`\`\`\n`;
          });
        }
        md += `\n`;
      });
    }

    return md;
  }

  generateBranchMarkdown(reportData, branchName) {
    const branchChanges = reportData.fileChanges.filter(change => change.branch === branchName);
    const branchCommits = reportData.commits.filter(commit => commit.branch === branchName);

    let md = `# Branch Report: ${branchName}\n\n`;
    md += `**Generated:** ${moment().format('YYYY-MM-DD HH:mm:ss')}\n\n`;

    md += `## Summary\n\n`;
    md += `- **Commits:** ${branchCommits.length}\n`;
    md += `- **Files Changed:** ${branchChanges.length}\n`;
    md += `- **Total Additions:** ${branchChanges.reduce((sum, change) => sum + change.additions, 0)}\n`;
    md += `- **Total Deletions:** ${branchChanges.reduce((sum, change) => sum + change.deletions, 0)}\n\n`;

    md += `## Recent Commits\n\n`;
    branchCommits.slice(0, 20).forEach(commit => {
      md += `### ${moment(commit.author.date).format('YYYY-MM-DD HH:mm')} - [\`${commit.sha.substring(0, 8)}\`](${commit.url})\n\n`;
      md += `**Author:** ${commit.author.name}\n`;
      md += `**Message:** ${commit.message.split('\n')[0]}\n`;
      md += `**Stats:** +${commit.stats.additions} -${commit.stats.deletions}\n\n`;
    });

    return md;
  }

  async generateCSVReport(reportData) {
    const timestamp = moment().format('YYYY-MM-DD-HHmmss');

    // File changes CSV
    const fileChangesCSV = new Parser({
      fields: [
        'filename',
        'status',
        'additions',
        'deletions',
        'changes',
        'sha',
        'commitMessage',
        'authorName',
        'authorEmail',
        'date',
        'branch'
      ]
    });

    const fileChangesData = reportData.fileChanges.map(change => ({
      filename: change.filename,
      status: change.status,
      additions: change.additions,
      deletions: change.deletions,
      changes: change.changes,
      sha: change.sha,
      commitMessage: change.commitMessage.replace(/\n/g, ' '),
      authorName: change.author.name,
      authorEmail: change.author.email,
      date: change.date,
      branch: change.branch
    }));

    await fs.writeFile(
      path.join(this.outputDir, `file-changes-${timestamp}.csv`),
      fileChangesCSV.parse(fileChangesData)
    );

    // Commits CSV
    const commitsCSV = new Parser({
      fields: [
        'sha',
        'message',
        'authorName',
        'authorEmail',
        'date',
        'branch',
        'additions',
        'deletions',
        'total'
      ]
    });

    const commitsData = reportData.commits.map(commit => ({
      sha: commit.sha,
      message: commit.message.replace(/\n/g, ' '),
      authorName: commit.author.name,
      authorEmail: commit.author.email,
      date: commit.author.date,
      branch: commit.branch,
      additions: commit.stats.additions,
      deletions: commit.stats.deletions,
      total: commit.stats.total
    }));

    await fs.writeFile(
      path.join(this.outputDir, `commits-${timestamp}.csv`),
      commitsCSV.parse(commitsData)
    );
  }

  async generateJSONReport(reportData) {
    const timestamp = moment().format('YYYY-MM-DD-HHmmss');
    
    await fs.writeFile(
      path.join(this.outputDir, `migration-data-${timestamp}.json`),
      JSON.stringify(reportData, null, 2)
    );
  }
}
