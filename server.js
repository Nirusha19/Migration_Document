const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Octokit } = require('octokit');
const moment = require('moment');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize GitHub client
let octokit = null;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GitHub Migration Tool is running' });
});

// Initialize GitHub connection
app.post('/api/init-github', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'GitHub token is required' });
    }

    octokit = new Octokit({
      auth: token
    });

    // Test the connection
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    res.json({ 
      success: true, 
      message: 'GitHub connection established',
      user: user.login 
    });
  } catch (error) {
    console.error('GitHub initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to GitHub',
      details: error.message 
    });
  }
});

// Get repository information
app.get('/api/repository/:owner/:repo', async (req, res) => {
  try {
    if (!octokit) {
      return res.status(400).json({ error: 'GitHub not initialized' });
    }

    const { owner, repo } = req.params;
    
    const [repoData, branchesData] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listBranches({ owner, repo })
    ]);

    res.json({
      repository: repoData.data,
      branches: branchesData.data
    });
  } catch (error) {
    console.error('Repository fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repository data',
      details: error.message 
    });
  }
});

// Get commits between dates
app.get('/api/commits/:owner/:repo', async (req, res) => {
  try {
    if (!octokit) {
      return res.status(400).json({ error: 'GitHub not initialized' });
    }

    const { owner, repo } = req.params;
    const { fromDate, toDate, branch = 'main' } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'fromDate and toDate are required' });
    }

    const commits = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      since: fromDate,
      until: toDate,
      per_page: 100
    });

    res.json({
      commits: commits.data,
      total: commits.data.length
    });
  } catch (error) {
    console.error('Commits fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch commits',
      details: error.message 
    });
  }
});

// Generate migration document
app.post('/api/generate-migration', async (req, res) => {
  try {
    if (!octokit) {
      return res.status(400).json({ error: 'GitHub not initialized' });
    }

    const { 
      gitUrl, 
      fromDate, 
      toDate, 
      format = 'pdf',
      includeDetails = true 
    } = req.body;

    if (!gitUrl || !fromDate || !toDate) {
      return res.status(400).json({ 
        error: 'gitUrl, fromDate, and toDate are required' 
      });
    }

    // Parse GitHub URL
    const urlMatch = gitUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL' });
    }

    const [, owner, repo] = urlMatch;
    const repoName = repo.replace('.git', '');

    // Get repository and commit data
    const [repoData, commitsData, branchesData] = await Promise.all([
      octokit.rest.repos.get({ owner, repo: repoName }),
      octokit.rest.repos.listCommits({
        owner,
        repo: repoName,
        since: fromDate,
        until: toDate,
        per_page: 100
      }),
      octokit.rest.repos.listBranches({ owner, repo: repoName })
    ]);

    const migrationData = {
      repository: repoData.data,
      commits: commitsData.data,
      branches: branchesData.data,
      fromDate,
      toDate,
      generatedAt: new Date().toISOString()
    };

    let documentPath;
    if (format === 'pdf') {
      documentPath = await generatePDFDocument(migrationData);
    } else if (format === 'excel') {
      documentPath = await generateExcelDocument(migrationData);
    } else {
      return res.status(400).json({ error: 'Unsupported format' });
    }

    res.json({
      success: true,
      message: 'Migration document generated successfully',
      documentPath: path.basename(documentPath),
      downloadUrl: `/api/download/${path.basename(documentPath)}`
    });

  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate migration document',
      details: error.message 
    });
  }
});

// Download generated document
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'documents', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Generate PDF Document
async function generatePDFDocument(data) {
  const doc = new PDFDocument();
  const filename = `migration_${data.repository.name}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
  const filepath = path.join(__dirname, 'documents', filename);
  
  await fs.ensureDir(path.join(__dirname, 'documents'));
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Add content to PDF
  doc.fontSize(20).text('GitHub Migration Report', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(14).text(`Repository: ${data.repository.full_name}`);
  doc.fontSize(12).text(`From: ${moment(data.fromDate).format('YYYY-MM-DD HH:mm:ss')}`);
  doc.fontSize(12).text(`To: ${moment(data.toDate).format('YYYY-MM-DD HH:mm:ss')}`);
  doc.fontSize(12).text(`Generated: ${moment(data.generatedAt).format('YYYY-MM-DD HH:mm:ss')}`);
  doc.moveDown();

  doc.fontSize(16).text('Repository Details');
  doc.fontSize(10).text(`Description: ${data.repository.description || 'No description'}`);
  doc.fontSize(10).text(`Language: ${data.repository.language || 'Not specified'}`);
  doc.fontSize(10).text(`Stars: ${data.repository.stargazers_count}`);
  doc.fontSize(10).text(`Forks: ${data.repository.forks_count}`);
  doc.moveDown();

  doc.fontSize(16).text('Branches');
  data.branches.forEach(branch => {
    doc.fontSize(10).text(`• ${branch.name}`);
  });
  doc.moveDown();

  doc.fontSize(16).text(`Commits (${data.commits.length})`);
  data.commits.forEach((commit, index) => {
    doc.fontSize(10).text(`${index + 1}. ${commit.commit.message}`);
    doc.fontSize(8).text(`   Author: ${commit.commit.author.name} | Date: ${moment(commit.commit.author.date).format('YYYY-MM-DD HH:mm:ss')}`);
    doc.fontSize(8).text(`   SHA: ${commit.sha.substring(0, 8)}`);
    doc.moveDown(0.5);
  });

  doc.end();
  
  return new Promise((resolve) => {
    stream.on('finish', () => resolve(filepath));
  });
}

// Generate Excel Document
async function generateExcelDocument(data) {
  const workbook = new ExcelJS.Workbook();
  const filename = `migration_${data.repository.name}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;
  const filepath = path.join(__dirname, 'documents', filename);
  
  await fs.ensureDir(path.join(__dirname, 'documents'));

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Property', key: 'property', width: 20 },
    { header: 'Value', key: 'value', width: 40 }
  ];

  summarySheet.addRows([
    { property: 'Repository', value: data.repository.full_name },
    { property: 'Description', value: data.repository.description || 'No description' },
    { property: 'Language', value: data.repository.language || 'Not specified' },
    { property: 'From Date', value: moment(data.fromDate).format('YYYY-MM-DD HH:mm:ss') },
    { property: 'To Date', value: moment(data.toDate).format('YYYY-MM-DD HH:mm:ss') },
    { property: 'Total Commits', value: data.commits.length },
    { property: 'Total Branches', value: data.branches.length },
    { property: 'Generated At', value: moment(data.generatedAt).format('YYYY-MM-DD HH:mm:ss') }
  ]);

  // Commits sheet
  const commitsSheet = workbook.addWorksheet('Commits');
  commitsSheet.columns = [
    { header: 'SHA', key: 'sha', width: 12 },
    { header: 'Author', key: 'author', width: 20 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Message', key: 'message', width: 50 }
  ];

  data.commits.forEach(commit => {
    commitsSheet.addRow({
      sha: commit.sha.substring(0, 8),
      author: commit.commit.author.name,
      date: moment(commit.commit.author.date).format('YYYY-MM-DD HH:mm:ss'),
      message: commit.commit.message
    });
  });

  // Branches sheet
  const branchesSheet = workbook.addWorksheet('Branches');
  branchesSheet.columns = [
    { header: 'Branch Name', key: 'name', width: 20 },
    { header: 'Last Commit SHA', key: 'sha', width: 12 }
  ];

  data.branches.forEach(branch => {
    branchesSheet.addRow({
      name: branch.name,
      sha: branch.commit.sha.substring(0, 8)
    });
  });

  await workbook.xlsx.writeFile(filepath);
  return filepath;
}

// Start server
app.listen(PORT, () => {
  console.log(`GitHub Migration Tool server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});