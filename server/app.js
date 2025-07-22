import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GitHubMigrationTool } from '../src/GitHubMigrationTool.js';
import { ConfigManager } from '../src/ConfigManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store for ongoing analysis jobs
const analysisJobs = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { 
      token, 
      owner, 
      repo, 
      fromDate, 
      toDate, 
      branches,
      outputFormats,
      angularVersionFrom,
      angularVersionTo
    } = req.body;

    // Validate required fields
    if (!token || !owner || !repo) {
      return res.status(400).json({
        error: 'Missing required fields: token, owner, repo'
      });
    }

    // Generate job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store job status
    analysisJobs.set(jobId, {
      status: 'started',
      progress: 0,
      startTime: new Date(),
      config: { owner, repo, fromDate, toDate, branches }
    });

    // Start analysis in background
    analyzeRepository(jobId, {
      token,
      owner,
      repo,
      fromDate: fromDate || '2023-01-01',
      toDate: toDate || new Date().toISOString().split('T')[0],
      branches: branches || ['main'],
      outputFormats: outputFormats || ['json'],
      angularVersionFrom,
      angularVersionTo,
      outputDir: `./migration-docs/${jobId}`
    });

    res.json({
      jobId,
      status: 'started',
      message: 'Analysis started successfully'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to start analysis',
      message: error.message
    });
  }
});

app.get('/api/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = analysisJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }

  res.json(job);
});

app.get('/api/download/:jobId/:filename', (req, res) => {
  const { jobId, filename } = req.params;
  const job = analysisJobs.get(jobId);

  if (!job || job.status !== 'completed') {
    return res.status(404).json({
      error: 'Job not found or not completed'
    });
  }

  const filePath = path.join(__dirname, `../migration-docs/${jobId}/${filename}`);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(analysisJobs.entries()).map(([id, job]) => ({
    id,
    ...job
  }));
  res.json(jobs);
});

async function analyzeRepository(jobId, config) {
  try {
    const job = analysisJobs.get(jobId);
    
    // Update progress
    job.status = 'running';
    job.progress = 10;
    job.message = 'Initializing GitHub connection...';

    const configManager = new ConfigManager();
    const finalConfig = await configManager.buildConfig(config);

    // Validate config
    const validation = configManager.validateConfig(finalConfig);
    if (!validation.isValid) {
      job.status = 'failed';
      job.error = validation.errors.join(', ');
      return;
    }

    job.progress = 20;
    job.message = 'Connecting to GitHub...';

    const migrationTool = new GitHubMigrationTool(finalConfig);

    job.progress = 30;
    job.message = 'Fetching repository information...';

    const report = await migrationTool.generateMigrationReport();

    job.progress = 100;
    job.status = 'completed';
    job.message = 'Analysis completed successfully';
    job.endTime = new Date();
    job.report = {
      summary: report.summary,
      metadata: report.metadata
    };

  } catch (error) {
    console.error('Analysis job failed:', error);
    const job = analysisJobs.get(jobId);
    job.status = 'failed';
    job.error = error.message;
    job.endTime = new Date();
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GitHub Migration Documentation Tool Server`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /                    - Web interface');
  console.log('  POST /api/analyze         - Start migration analysis');
  console.log('  GET  /api/status/:jobId   - Check analysis status');
  console.log('  GET  /api/jobs            - List all jobs');
  console.log('  GET  /api/download/:jobId/:filename - Download reports');
});

export default app;
