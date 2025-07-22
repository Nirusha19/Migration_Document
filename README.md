# GitHub Migration Documentation Tool

A comprehensive tool to connect with GitHub.com and generate detailed migration documentation for Angular applications, tracking changes across branches with date ranges and file history.

## Features

- 🔗 Connect to GitHub repositories using GitHub API
- 📅 Generate migration reports with custom date ranges
- 🌿 Analyze multiple branches simultaneously
- 📊 Track Angular-specific changes (package.json, angular.json, etc.)
- 📝 Generate documentation in multiple formats (Markdown, CSV, JSON)
- 🔍 Detailed file change history with commit information
- ⚡ Fast parallel processing of multiple repositories

## Prerequisites

- Node.js 16+ 
- GitHub Personal Access Token with repository access
- Git installed on your system

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd github-migration-documentation-tool
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your GitHub credentials and settings.

## Configuration

### GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `user:email` (Access user email addresses)

### Environment Variables

- `GITHUB_TOKEN`: Your GitHub personal access token
- `GITHUB_OWNER`: Repository owner/organization name
- `GITHUB_REPO`: Repository name
- `FROM_DATE`: Start date for migration analysis (YYYY-MM-DD)
- `TO_DATE`: End date for migration analysis (YYYY-MM-DD)
- `BRANCHES`: Comma-separated list of branches to analyze
- `OUTPUT_DIR`: Directory for generated documentation
- `OUTPUT_FORMAT`: Output formats (markdown,csv,json)

## Usage

### Basic Usage

```bash
npm start
```

### Command Line Options

```bash
# Analyze specific repository
npm start -- --owner microsoft --repo vscode --from 2023-01-01 --to 2024-01-01

# Analyze specific branches
npm start -- --branches main,develop,feature/angular-17

# Generate specific output formats
npm start -- --format markdown,csv

# Interactive mode
npm start -- --interactive
```

### Programmatic Usage

```javascript
import { GitHubMigrationTool } from './src/GitHubMigrationTool.js';

const tool = new GitHubMigrationTool({
  token: 'your-github-token',
  owner: 'repository-owner',
  repo: 'repository-name'
});

const report = await tool.generateMigrationReport({
  fromDate: '2023-01-01',
  toDate: '2024-01-01',
  branches: ['main', 'develop'],
  outputFormats: ['markdown', 'json']
});
```

## Output Examples

The tool generates comprehensive migration documentation including:

- **Summary Report**: Overview of changes across all branches
- **Detailed File Changes**: Line-by-line change tracking
- **Angular-Specific Changes**: Package updates, configuration changes
- **Timeline**: Chronological view of migration progress
- **Branch Comparison**: Differences between branches

## Sample Output Structure

```
migration-docs/
├── migration-summary-2024-01-15-143022.md
├── detailed-changes-2024-01-15-143022.md
├── angular-migration-2024-01-15-143022.md
├── file-changes-2024-01-15-143022.csv
├── commits-2024-01-15-143022.csv
├── migration-data-2024-01-15-143022.json
└── branches/
    ├── main-changes-2024-01-15-143022.md
    ├── develop-changes-2024-01-15-143022.md
    └── feature-migration-changes-2024-01-15-143022.md
```

## Step-by-Step Setup Guide

### 1. Install Node.js
```bash
# On Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# On macOS
brew install node

# On Windows
# Download from https://nodejs.org
```

### 2. Get GitHub Token
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/personal-access-tokens/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `user:email`
4. Copy the generated token

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Tool
```bash
# Interactive mode (recommended for first run)
npm start -- --interactive

# Or with command line options
npm start -- --owner your-org --repo your-repo --from 2023-01-01 --to 2024-01-01
```

## Examples

### Analyze Angular Migration from v12 to v17
```bash
npm start -- \
  --owner angular \
  --repo angular \
  --from 2022-01-01 \
  --to 2024-01-01 \
  --branches main,12.x.x,17.x.x \
  --angular-from 12 \
  --angular-to 17 \
  --format markdown,csv,json
```

### Analyze Feature Branch Migration
```bash
npm start -- \
  --owner your-org \
  --repo your-angular-app \
  --from 2023-06-01 \
  --to 2023-12-31 \
  --branches main,feature/angular-upgrade,develop \
  --format markdown
```

## Troubleshooting

### Rate Limiting
If you encounter rate limiting:
- Use a GitHub token with higher rate limits
- Add delays between API calls (automatically handled)
- Reduce the date range or number of branches

### Large Repositories
For large repositories:
- Use specific date ranges
- Focus on specific branches
- Use JSON format for programmatic processing

### Authentication Issues
- Verify your GitHub token has correct permissions
- Check token expiration date
- Ensure repository access permissions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**Happy Migration Documentation! 🚀**
