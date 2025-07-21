const express = require('express');
const router = express.Router();
const gitService = require('../services/gitService');
const documentService = require('../services/documentService');
const moment = require('moment');

function validateGitHubUrl(url) {
  const regex = /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+\/?$/;
  return regex.test(url);
}

function validateDate(dateString) {
  return moment(dateString, 'YYYY-MM-DD', true).isValid();
}

router.get('/repo-info', async (req, res) => {
  try {
    const { gitUrl } = req.query;
    if (!gitUrl) {
      return res.status(400).json({ error: 'Git URL is required' });
    }
    if (!validateGitHubUrl(gitUrl)) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }
    const repoInfo = await gitService.getRepositoryInfo(gitUrl);
    res.json(repoInfo);
  } catch (error) {
    console.error('Error fetching repository info:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { gitUrl, fromDate, toDate, branch, format } = req.body;

    if (!gitUrl || !fromDate || !toDate) {
      return res.status(400).json({ 
        error: 'Git URL, from date, and to date are required' 
      });
    }

    if (!validateGitHubUrl(gitUrl)) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    if (!validateDate(fromDate) || !validateDate(toDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    if (moment(fromDate).isAfter(moment(toDate))) {
      return res.status(400).json({ 
        error: 'From date cannot be after to date' 
      });
    }

    const migrationData = await gitService.generateMigrationData(
      gitUrl, 
      fromDate, 
      toDate, 
      branch || 'main'
    );

    let document, contentType, filename;

    switch (format) {
      case 'html':
        document = documentService.generateHtmlDocument(migrationData);
        contentType = 'text/html';
        filename = `migration-report-${migrationData.repository.name}-${moment().format('YYYY-MM-DD')}.html`;
        break;
      case 'json':
        document = documentService.generateJsonDocument(migrationData);
        contentType = 'application/json';
        filename = `migration-report-${migrationData.repository.name}-${moment().format('YYYY-MM-DD')}.json`;
        break;
      case 'csv':
        document = documentService.generateCsvDocument(migrationData);
        contentType = 'text/csv';
        filename = `migration-report-${migrationData.repository.name}-${moment().format('YYYY-MM-DD')}.csv`;
        break;
      case 'markdown':
      default:
        document = documentService.generateMarkdownDocument(migrationData);
        contentType = 'text/markdown';
        filename = `migration-report-${migrationData.repository.name}-${moment().format('YYYY-MM-DD')}.md`;
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(document);

  } catch (error) {
    console.error('Error generating migration document:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/preview', async (req, res) => {
  try {
    const { gitUrl, fromDate, toDate, branch } = req.body;

    if (!gitUrl || !fromDate || !toDate) {
      return res.status(400).json({ 
        error: 'Git URL, from date, and to date are required' 
      });
    }

    if (!validateGitHubUrl(gitUrl)) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    if (!validateDate(fromDate) || !validateDate(toDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    if (moment(fromDate).isAfter(moment(toDate))) {
      return res.status(400).json({ 
        error: 'From date cannot be after to date' 
      });
    }

    const migrationData = await gitService.generateMigrationData(
      gitUrl, 
      fromDate, 
      toDate, 
      branch || 'main'
    );

    const preview = {
      metadata: migrationData.metadata,
      repository: {
        name: migrationData.repository.name,
        fullName: migrationData.repository.fullName,
        description: migrationData.repository.description,
        defaultBranch: migrationData.repository.defaultBranch,
        language: migrationData.repository.language,
        branches: migrationData.repository.branches
      },
      statistics: migrationData.statistics,
      summary: {
        commitsPreview: migrationData.commits.slice(0, 5),
        pullRequestsPreview: migrationData.pullRequests.slice(0, 5),
        issuesPreview: migrationData.issues.slice(0, 5),
        releasesPreview: migrationData.releases.slice(0, 3),
        contributorsPreview: migrationData.contributors.slice(0, 10)
      }
    };

    res.json(preview);

  } catch (error) {
    console.error('Error generating migration preview:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const { gitUrl } = req.query;

    if (!gitUrl) {
      return res.status(400).json({ error: 'Git URL is required' });
    }

    if (!validateGitHubUrl(gitUrl)) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const repoInfo = await gitService.getRepositoryInfo(gitUrl);
    res.json({ 
      defaultBranch: repoInfo.defaultBranch,
      branches: repoInfo.branches 
    });

  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;