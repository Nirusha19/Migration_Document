# GitHub Migration Tool

A comprehensive tool for generating migration documents from GitHub repositories. This tool connects with GitHub's API to extract repository data including commits, pull requests, issues, releases, and contributor information within specified date ranges.

## Features

✅ **Repository Analysis**
- Extract commits, pull requests, issues, and releases
- Analyze contributor statistics
- Branch information and repository metadata
- Lines of code changes tracking

✅ **Multiple Export Formats**
- HTML (styled, professional reports)
- Markdown (GitHub-compatible)
- JSON (raw data for further processing)
- CSV (for spreadsheet analysis)

✅ **Date Range Filtering**
- Specify from/to dates for migration analysis
- Time-based filtering for all data types
- Historical change tracking

✅ **Modern Web Interface**
- Responsive design
- Real-time preview functionality
- Branch selection
- Form validation

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- GitHub Personal Access Token

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd /workspace/github-migration-tool/backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# GitHub Authentication
GITHUB_TOKEN=your_github_personal_access_token_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Settings
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Get GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy the token and add it to your `.env` file

### 4. Start the Server

#### Development Mode (with auto-restart):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 5. Access the Tool

Open your browser and navigate to:
**http://localhost:3000**

## API Endpoints

### GET /health
Health check endpoint

### GET /api/migration/repo-info
Get repository information
- **Query:** `gitUrl` - GitHub repository URL

### GET /api/migration/branches
Get available branches for a repository
- **Query:** `gitUrl` - GitHub repository URL

### GET /api/migration/validate-url
Validate GitHub URL and check access
- **Query:** `gitUrl` - GitHub repository URL

### POST /api/migration/preview
Preview migration data without generating document
- **Body:** `{ gitUrl, fromDate, toDate, branch }`

### POST /api/migration/generate
Generate and download migration document
- **Body:** `{ gitUrl, fromDate, toDate, branch, format }`

## Usage Examples

### 1. Basic Migration Report

1. Enter GitHub repository URL: `https://github.com/owner/repository`
2. Select date range (e.g., last 30 days)
3. Choose branch (defaults to main/master)
4. Select export format (HTML recommended)
5. Click "Generate Report"

### 2. Preview Before Generation

1. Fill in the form with repository details
2. Click "Preview Data" to see statistics
3. Review the data summary
4. Generate the full report if satisfied

### 3. API Usage

```javascript
// Preview migration data
const response = await fetch('/api/migration/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gitUrl: 'https://github.com/owner/repo',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    branch: 'main'
  })
});

// Generate report
const reportResponse = await fetch('/api/migration/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gitUrl: 'https://github.com/owner/repo',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    branch: 'main',
    format: 'html'
  })
});
```

## Data Collected

### Repository Information
- Name, description, language
- Creation and last update dates
- Stars, forks, open issues count
- Branch information and protection status

### Commits
- SHA, message, author, committer
- Date and time information
- Lines added/deleted, files changed
- Commit URLs for reference

### Pull Requests
- Number, title, description
- Author, state (open/closed/merged)
- Creation, update, merge dates
- Base and head branches
- Code change statistics

### Issues
- Number, title, description
- Author, assignees, labels
- State and date information
- Issue URLs for reference

### Releases
- Tag name, release name
- Author and publish date
- Release notes and assets
- Pre-release indicators

### Contributors
- Username and contributions count
- User type and profile information
- Activity statistics

## Report Formats

### HTML Report
- Professional styled document
- Interactive tables and charts
- Responsive design
- Print-friendly layout

### Markdown Report
- GitHub-compatible format
- Table structures for data
- Links to original resources
- Easy to integrate with documentation

### JSON Report
- Complete raw data export
- Suitable for further processing
- All collected information included
- API-compatible format

### CSV Report
- Spreadsheet-compatible format
- Flattened data structure
- Suitable for analysis tools
- Import into Excel/Google Sheets

## Security Features

- Rate limiting protection
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- GitHub token secure handling

## Error Handling

The tool provides comprehensive error handling for:
- Invalid GitHub URLs
- Repository access issues
- Network connectivity problems
- API rate limiting
- Invalid date ranges

## Troubleshooting

### Common Issues

1. **"Repository not found" error**
   - Check GitHub URL format
   - Verify repository access permissions
   - Ensure GitHub token has correct scopes

2. **Rate limiting errors**
   - GitHub API has rate limits
   - Wait before making more requests
   - Consider using authenticated requests

3. **Empty data in reports**
   - Check date range selection
   - Verify branch selection
   - Ensure repository has activity in date range

### Support

For issues or questions:
1. Check the error messages in the browser console
2. Verify your GitHub token permissions
3. Test with a public repository first
4. Review the API endpoint responses

## Architecture

### Backend (Node.js + Express)
- **Services**: GitHub API integration, document generation
- **Routes**: RESTful API endpoints
- **Middleware**: Security, logging, error handling
- **Dependencies**: Octokit (GitHub API), moment (dates), simple-git

### Frontend (HTML/CSS/JavaScript)
- **Interface**: Responsive web form
- **Features**: Real-time validation, preview functionality
- **Design**: Modern, professional UI
- **Interactions**: AJAX API calls, file downloads

## Future Enhancements

Potential features for future versions:
- Multiple repository analysis
- Advanced filtering options
- Charts and visualizations
- Email report delivery
- Scheduled report generation
- Custom report templates
- Integration with other Git platforms

---

**GitHub Migration Tool** - Simplifying repository migration documentation