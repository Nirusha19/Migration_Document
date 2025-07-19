const moment = require('moment');

class DocumentService {
  generateHtmlDocument(migrationData) {
    const { metadata, repository, statistics, commits } = migrationData;
    return `<!DOCTYPE html>
<html><head><title>Migration Report - ${repository.name}</title></head>
<body><h1>Migration Report: ${repository.name}</h1>
<p>Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}</p>
<h2>Statistics</h2>
<ul>
<li>Commits: ${statistics.totalCommits}</li>
<li>Pull Requests: ${statistics.totalPullRequests}</li>
<li>Issues: ${statistics.totalIssues}</li>
</ul></body></html>`;
  }

  generateJsonDocument(migrationData) {
    return JSON.stringify(migrationData, null, 2);
  }

  generateCsvDocument(migrationData) {
    const { commits } = migrationData;
    let csv = 'Date,Author,Message,URL\n';
    commits.forEach(commit => {
      csv += `"${moment(commit.author.date).format('YYYY-MM-DD')}","${commit.author.name}","${commit.message.replace(/"/g, '""')}","${commit.url}"\n`;
    });
    return csv;
  }

  generateMarkdownDocument(migrationData) {
    const { metadata, repository, statistics } = migrationData;
    return `# Migration Report: ${repository.name}

**Generated:** ${moment().format('YYYY-MM-DD HH:mm:ss')}
**Repository:** ${repository.fullName}
**Date Range:** ${metadata.fromDate} to ${metadata.toDate}

## Statistics
- Commits: ${statistics.totalCommits}
- Pull Requests: ${statistics.totalPullRequests}
- Issues: ${statistics.totalIssues}
`;
  }
}

module.exports = new DocumentService();