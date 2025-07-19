const moment = require('moment');

class DocumentService {
  /**
   * Generate HTML migration document
   */
  generateHtmlDocument(migrationData) {
    const { metadata, repository, statistics, commits, pullRequests, issues, releases, contributors } = migrationData;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Migration Report - ${repository.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 3px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007acc;
            margin: 0;
            font-size: 2.5em;
        }
        .metadata {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #007acc, #0099ff);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        .stat-card p {
            margin: 0;
            opacity: 0.9;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .table-container {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #007acc;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .commit-message {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .branch-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Migration Report</h1>
            <h2>${repository.name}</h2>
            <p>${repository.description || 'No description available'}</p>
        </div>

        <div class="metadata">
            <h3>Report Metadata</h3>
            <p><strong>Repository:</strong> ${repository.fullName}</p>
            <p><strong>Git URL:</strong> ${metadata.gitUrl}</p>
            <p><strong>Branch:</strong> ${metadata.selectedBranch}</p>
            <p><strong>Date Range:</strong> ${moment(metadata.fromDate).format('YYYY-MM-DD')} to ${moment(metadata.toDate).format('YYYY-MM-DD')}</p>
            <p><strong>Time Period:</strong> ${metadata.timeRange}</p>
            <p><strong>Generated At:</strong> ${moment(metadata.generatedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>

        <div class="section">
            <h2>Repository Information</h2>
            <div class="branch-info">
                <p><strong>Default Branch:</strong> ${repository.defaultBranch}</p>
                <p><strong>Primary Language:</strong> ${repository.language || 'Not specified'}</p>
                <p><strong>Repository Size:</strong> ${repository.size} KB</p>
                <p><strong>Stars:</strong> ${repository.stargazers}</p>
                <p><strong>Forks:</strong> ${repository.forks}</p>
                <p><strong>Open Issues:</strong> ${repository.openIssues}</p>
                <p><strong>Created:</strong> ${moment(repository.createdAt).format('YYYY-MM-DD')}</p>
                <p><strong>Last Updated:</strong> ${moment(repository.updatedAt).format('YYYY-MM-DD')}</p>
            </div>
            
            <h3>Available Branches</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Branch Name</th>
                            <th>SHA</th>
                            <th>Protected</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${repository.branches.map(branch => `
                            <tr>
                                <td>${branch.name}</td>
                                <td>${branch.sha.substring(0, 10)}...</td>
                                <td>${branch.protected ? 'Yes' : 'No'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <h2>Migration Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${statistics.totalCommits}</h3>
                    <p>Total Commits</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.totalPullRequests}</h3>
                    <p>Pull Requests</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.totalIssues}</h3>
                    <p>Issues</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.totalReleases}</h3>
                    <p>Releases</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.linesAdded}</h3>
                    <p>Lines Added</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.linesDeleted}</h3>
                    <p>Lines Deleted</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.filesChanged}</h3>
                    <p>Files Changed</p>
                </div>
                <div class="stat-card">
                    <h3>${statistics.activeContributors}</h3>
                    <p>Active Contributors</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Commit History</h2>
            ${commits.length > 0 ? `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Author</th>
                                <th>Message</th>
                                <th>Changes</th>
                                <th>SHA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${commits.slice(0, 50).map(commit => `
                                <tr>
                                    <td>${moment(commit.author.date).format('YYYY-MM-DD HH:mm')}</td>
                                    <td>${commit.author.name}</td>
                                    <td class="commit-message" title="${commit.message}">${commit.message}</td>
                                    <td>+${commit.additions} -${commit.deletions}</td>
                                    <td><a href="${commit.url}" target="_blank">${commit.sha.substring(0, 10)}</a></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${commits.length > 50 ? `<p><em>Showing first 50 of ${commits.length} commits</em></p>` : ''}
                </div>
            ` : '<div class="no-data">No commits found in the specified date range</div>'}
        </div>

        <div class="section">
            <h2>Pull Requests</h2>
            ${pullRequests.length > 0 ? `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>State</th>
                                <th>Created</th>
                                <th>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pullRequests.map(pr => `
                                <tr>
                                    <td><a href="${pr.url}" target="_blank">#${pr.number}</a></td>
                                    <td>${pr.title}</td>
                                    <td>${pr.author}</td>
                                    <td>${pr.state}</td>
                                    <td>${moment(pr.createdAt).format('YYYY-MM-DD')}</td>
                                    <td>${moment(pr.updatedAt).format('YYYY-MM-DD')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="no-data">No pull requests found in the specified date range</div>'}
        </div>

        <div class="section">
            <h2>Issues</h2>
            ${issues.length > 0 ? `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Number</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>State</th>
                                <th>Created</th>
                                <th>Labels</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${issues.map(issue => `
                                <tr>
                                    <td><a href="${issue.url}" target="_blank">#${issue.number}</a></td>
                                    <td>${issue.title}</td>
                                    <td>${issue.author}</td>
                                    <td>${issue.state}</td>
                                    <td>${moment(issue.createdAt).format('YYYY-MM-DD')}</td>
                                    <td>${issue.labels.join(', ') || 'None'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="no-data">No issues found in the specified date range</div>'}
        </div>

        <div class="section">
            <h2>Contributors</h2>
            ${contributors.length > 0 ? `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Contributions</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${contributors.map(contributor => `
                                <tr>
                                    <td><a href="${contributor.url}" target="_blank">${contributor.login}</a></td>
                                    <td>${contributor.contributions}</td>
                                    <td>${contributor.type}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div class="no-data">No contributors found</div>'}
        </div>

        ${releases.length > 0 ? `
            <div class="section">
                <h2>Releases</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Tag</th>
                                <th>Name</th>
                                <th>Author</th>
                                <th>Published</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${releases.map(release => `
                                <tr>
                                    <td><a href="${release.url}" target="_blank">${release.tagName}</a></td>
                                    <td>${release.name || 'Unnamed'}</td>
                                    <td>${release.author || 'Unknown'}</td>
                                    <td>${moment(release.publishedAt).format('YYYY-MM-DD')}</td>
                                    <td>${release.prerelease ? 'Pre-release' : 'Release'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}

        <div class="footer">
            <p>Generated by GitHub Migration Tool on ${moment().format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate JSON migration document
   */
  generateJsonDocument(migrationData) {
    return JSON.stringify(migrationData, null, 2);
  }

  /**
   * Generate CSV migration document
   */
  generateCsvDocument(migrationData) {
    const { commits, pullRequests, issues } = migrationData;
    
    let csv = 'Type,Date,Author,Title/Message,URL,State,Additions,Deletions\n';
    
    // Add commits
    commits.forEach(commit => {
      csv += `Commit,"${moment(commit.author.date).format('YYYY-MM-DD HH:mm')}","${commit.author.name}","${commit.message.replace(/"/g, '""')}","${commit.url}",N/A,${commit.additions},${commit.deletions}\n`;
    });
    
    // Add pull requests
    pullRequests.forEach(pr => {
      csv += `Pull Request,"${moment(pr.createdAt).format('YYYY-MM-DD HH:mm')}","${pr.author}","${pr.title.replace(/"/g, '""')}","${pr.url}","${pr.state}",${pr.additions || 0},${pr.deletions || 0}\n`;
    });
    
    // Add issues
    issues.forEach(issue => {
      csv += `Issue,"${moment(issue.createdAt).format('YYYY-MM-DD HH:mm')}","${issue.author}","${issue.title.replace(/"/g, '""')}","${issue.url}","${issue.state}",0,0\n`;
    });
    
    return csv;
  }

  /**
   * Generate Markdown migration document
   */
  generateMarkdownDocument(migrationData) {
    const { metadata, repository, statistics, commits, pullRequests, issues, releases, contributors } = migrationData;

    let markdown = `# Migration Report: ${repository.name}

## Repository Information
- **Repository:** ${repository.fullName}
- **Description:** ${repository.description || 'No description available'}
- **Git URL:** ${metadata.gitUrl}
- **Branch:** ${metadata.selectedBranch}
- **Date Range:** ${moment(metadata.fromDate).format('YYYY-MM-DD')} to ${moment(metadata.toDate).format('YYYY-MM-DD')}
- **Time Period:** ${metadata.timeRange}
- **Generated At:** ${moment(metadata.generatedAt).format('YYYY-MM-DD HH:mm:ss')}

## Repository Details
- **Default Branch:** ${repository.defaultBranch}
- **Primary Language:** ${repository.language || 'Not specified'}
- **Repository Size:** ${repository.size} KB
- **Stars:** ${repository.stargazers}
- **Forks:** ${repository.forks}
- **Open Issues:** ${repository.openIssues}
- **Created:** ${moment(repository.createdAt).format('YYYY-MM-DD')}
- **Last Updated:** ${moment(repository.updatedAt).format('YYYY-MM-DD')}

## Migration Statistics
- **Total Commits:** ${statistics.totalCommits}
- **Total Pull Requests:** ${statistics.totalPullRequests}
- **Total Issues:** ${statistics.totalIssues}
- **Total Releases:** ${statistics.totalReleases}
- **Lines Added:** ${statistics.linesAdded}
- **Lines Deleted:** ${statistics.linesDeleted}
- **Files Changed:** ${statistics.filesChanged}
- **Active Contributors:** ${statistics.activeContributors}

## Available Branches
| Branch Name | SHA | Protected |
|-------------|-----|-----------|
${repository.branches.map(branch => 
  `| ${branch.name} | ${branch.sha.substring(0, 10)}... | ${branch.protected ? 'Yes' : 'No'} |`
).join('\n')}

## Commit History
${commits.length > 0 ? `
| Date | Author | Message | Changes | SHA |
|------|--------|---------|---------|-----|
${commits.slice(0, 20).map(commit => 
  `| ${moment(commit.author.date).format('YYYY-MM-DD HH:mm')} | ${commit.author.name} | ${commit.message.replace(/\|/g, '\\|')} | +${commit.additions} -${commit.deletions} | [${commit.sha.substring(0, 10)}](${commit.url}) |`
).join('\n')}

${commits.length > 20 ? `*Showing first 20 of ${commits.length} commits*` : ''}
` : '*No commits found in the specified date range*'}

## Pull Requests
${pullRequests.length > 0 ? `
| Number | Title | Author | State | Created | Updated |
|--------|-------|--------|-------|---------|---------|
${pullRequests.map(pr => 
  `| [#${pr.number}](${pr.url}) | ${pr.title.replace(/\|/g, '\\|')} | ${pr.author} | ${pr.state} | ${moment(pr.createdAt).format('YYYY-MM-DD')} | ${moment(pr.updatedAt).format('YYYY-MM-DD')} |`
).join('\n')}
` : '*No pull requests found in the specified date range*'}

## Issues
${issues.length > 0 ? `
| Number | Title | Author | State | Created | Labels |
|--------|-------|--------|-------|---------|--------|
${issues.map(issue => 
  `| [#${issue.number}](${issue.url}) | ${issue.title.replace(/\|/g, '\\|')} | ${issue.author} | ${issue.state} | ${moment(issue.createdAt).format('YYYY-MM-DD')} | ${issue.labels.join(', ') || 'None'} |`
).join('\n')}
` : '*No issues found in the specified date range*'}

## Contributors
${contributors.length > 0 ? `
| Username | Contributions | Type |
|----------|---------------|------|
${contributors.map(contributor => 
  `| [${contributor.login}](${contributor.url}) | ${contributor.contributions} | ${contributor.type} |`
).join('\n')}
` : '*No contributors found*'}

${releases.length > 0 ? `
## Releases
| Tag | Name | Author | Published | Type |
|-----|------|--------|-----------|------|
${releases.map(release => 
  `| [${release.tagName}](${release.url}) | ${release.name || 'Unnamed'} | ${release.author || 'Unknown'} | ${moment(release.publishedAt).format('YYYY-MM-DD')} | ${release.prerelease ? 'Pre-release' : 'Release'} |`
).join('\n')}
` : ''}

---
*Generated by GitHub Migration Tool on ${moment().format('YYYY-MM-DD HH:mm:ss')}*
`;

    return markdown;
  }
}

module.exports = new DocumentService();