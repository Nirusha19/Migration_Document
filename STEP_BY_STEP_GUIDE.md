# GitHub Migration Documentation Tool - Complete Step-by-Step Guide

This guide provides complete steps to create and use a tool that connects with GitHub.com to generate migration documentation for Angular applications with date ranges, file history, and branch analysis.

## 📋 Overview

The tool will:
- Connect to GitHub repositories using the GitHub API
- Analyze commits and file changes within specified date ranges
- Track Angular-specific changes (package.json, angular.json, components, etc.)
- Generate comprehensive migration documentation
- Support multiple output formats (Markdown, CSV, JSON)
- Analyze multiple branches simultaneously

## 🛠️ Step 1: Project Setup

### 1.1 Prerequisites
```bash
# Check Node.js version (16+ required)
node --version

# Check npm version
npm --version

# Check git installation
git --version
```

### 1.2 Initialize Project
```bash
# Create project directory
mkdir github-migration-tool
cd github-migration-tool

# Initialize npm project
npm init -y
```

### 1.3 Install Dependencies
```bash
npm install @octokit/rest @octokit/auth-token commander dotenv moment chalk inquirer fs-extra lodash json2csv marked
npm install --save-dev nodemon eslint jest
```

## 🔧 Step 2: GitHub API Setup

### 2.1 Create GitHub Personal Access Token
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/personal-access-tokens/tokens)
2. Click "Generate new token (classic)"
3. Set expiration (90 days recommended)
4. Select scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:org` - Read org and team membership
   - ✅ `user:email` - Access user email addresses
5. Generate and copy the token

### 2.2 Environment Configuration
Create `.env.example`:
```bash
# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=repository_owner
GITHUB_REPO=repository_name

# Date Range for Migration Analysis (YYYY-MM-DD)
FROM_DATE=2023-01-01
TO_DATE=2024-12-31

# Branches to analyze (comma separated)
BRANCHES=main,develop,feature/migration

# Output Configuration
OUTPUT_DIR=./migration-docs
OUTPUT_FORMAT=markdown,csv,json

# Angular Specific Configuration
ANGULAR_VERSION_FROM=12
ANGULAR_VERSION_TO=17
INCLUDE_DEPENDENCIES=true
INCLUDE_CONFIG_CHANGES=true
```

## 💻 Step 3: Core Implementation

### 3.1 Main Entry Point (src/index.js)
This file handles:
- Command-line interface
- Configuration parsing
- Interactive mode
- Error handling

Key features:
- CLI options for all configuration
- Interactive mode for guided setup
- Validation and error reporting

### 3.2 GitHub API Integration (src/GitHubMigrationTool.js)
This class handles:
- GitHub API authentication
- Repository information fetching
- Commit and file change analysis
- Rate limiting management

Key methods:
- `generateMigrationReport()` - Main analysis method
- `getCommitsInDateRange()` - Fetch commits by date
- `getFileChanges()` - Analyze file modifications
- `getBranches()` - Get branch information

### 3.3 Configuration Management (src/ConfigManager.js)
Handles:
- Environment variable parsing
- Command-line option processing
- Configuration validation
- Default value management

### 3.4 Angular-Specific Analysis (src/AngularAnalyzer.js)
Specialized for Angular projects:
- Detects Angular files (components, services, modules)
- Analyzes package.json changes
- Tracks configuration updates
- Identifies migration patterns
- Generates migration steps

### 3.5 Report Generation (src/ReportGenerator.js)
Creates multiple output formats:
- Markdown reports with detailed analysis
- CSV files for data processing
- JSON files for programmatic use
- Branch-specific reports

## 📊 Step 4: Usage Examples

### 4.1 Basic Angular Migration Analysis
```bash
npm start -- \
  --owner angular \
  --repo angular \
  --from 2023-01-01 \
  --to 2024-01-01 \
  --branches main,16.x.x,17.x.x \
  --angular-from 16 \
  --angular-to 17
```

### 4.2 Feature Branch Analysis
```bash
npm start -- \
  --owner your-org \
  --repo your-app \
  --from 2023-06-01 \
  --to 2023-12-31 \
  --branches main,feature/angular-upgrade \
  --format markdown,csv
```

### 4.3 Interactive Mode
```bash
npm start -- --interactive
```

## 📄 Step 5: Output Documentation

### 5.1 Generated Reports
The tool creates:

```
migration-docs/
├── migration-summary-2024-01-15-143022.md      # Overview report
├── detailed-changes-2024-01-15-143022.md       # Detailed file changes
├── angular-migration-2024-01-15-143022.md      # Angular-specific analysis
├── file-changes-2024-01-15-143022.csv          # File changes data
├── commits-2024-01-15-143022.csv               # Commit data
├── migration-data-2024-01-15-143022.json       # Complete data export
└── branches/
    ├── main-changes-2024-01-15-143022.md       # Branch-specific reports
    └── develop-changes-2024-01-15-143022.md
```

### 5.2 Report Contents

**Summary Report** includes:
- Repository information
- Analysis statistics
- Branch overview
- Angular migration summary

**Detailed Report** includes:
- File-by-file change analysis
- Commit history with patches
- Author and date information
- Change statistics

**Angular Report** includes:
- Package.json dependency changes
- Configuration file updates
- Component/service modifications
- Migration step recommendations

## 🔍 Step 6: Angular-Specific Features

### 6.1 Detected File Types
- `package.json` - Dependency tracking
- `angular.json` - Configuration changes
- `tsconfig.json` - TypeScript updates
- `*.component.ts/html/css` - Component changes
- `*.service.ts` - Service modifications
- `*.module.ts` - Module updates

### 6.2 Migration Pattern Detection
- Angular CLI updates (`ng update`)
- TypeScript version changes
- Package dependency updates
- Configuration migrations
- Component modernization (OnPush, standalone)
- Router updates
- RxJS pattern changes

### 6.3 Generated Migration Steps
The tool automatically generates:
1. Dependency update commands
2. Configuration update steps
3. TypeScript compilation checks
4. Component migration guidelines
5. Testing recommendations

## 🚀 Step 7: Advanced Usage

### 7.1 Programmatic Usage
```javascript
import { GitHubMigrationTool } from './src/GitHubMigrationTool.js';

const tool = new GitHubMigrationTool({
  token: 'your-token',
  owner: 'repo-owner',
  repo: 'repo-name',
  fromDate: '2023-01-01',
  toDate: '2024-01-01',
  branches: ['main', 'develop']
});

const report = await tool.generateMigrationReport();
```

### 7.2 Custom Analysis
```javascript
// Get specific file changes
const commits = await tool.getCommitsInDateRange();
const fileChanges = await tool.getFileChanges(commits);

// Analyze Angular patterns
const angularChanges = await analyzer.analyzeChanges(fileChanges);

// Compare specific files
const comparison = await tool.compareFiles('package.json', 'v1.0', 'v2.0');
```

## 🛡️ Step 8: Best Practices

### 8.1 Security
- Store GitHub tokens in environment variables
- Use minimal required scopes
- Set token expiration dates
- Never commit tokens to version control

### 8.2 Performance
- Use specific date ranges for large repositories
- Limit number of branches analyzed
- Implement rate limiting respect
- Cache results when possible

### 8.3 Rate Limiting
- GitHub API limits: 5,000 requests/hour (authenticated)
- Tool automatically handles rate limits
- Adds delays between requests
- Provides clear error messages

## 🔧 Step 9: Troubleshooting

### 9.1 Common Issues

**Authentication Failed**
```bash
# Check token validity
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Regenerate token if needed
```

**Rate Limit Exceeded**
```bash
# Check current rate limit
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit

# Wait for reset or use shorter date ranges
```

**No Data Found**
- Verify repository exists and is accessible
- Check date ranges are correct
- Ensure branch names are accurate
- Confirm repository has commits in date range

### 9.2 Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm start -- --interactive
```

## 🎯 Step 10: Real-World Examples

### 10.1 Angular 12 to 17 Migration
```bash
npm start -- \
  --owner your-org \
  --repo your-angular-app \
  --from 2023-01-01 \
  --to 2024-01-01 \
  --branches main,feature/ng17-upgrade \
  --angular-from 12 \
  --angular-to 17 \
  --format markdown,json
```

### 10.2 Release Comparison
```bash
npm start -- \
  --owner your-org \
  --repo your-app \
  --from 2023-01-01 \
  --to 2024-01-01 \
  --branches release/v1.0,release/v2.0,main \
  --format csv,json
```

### 10.3 Sprint Analysis
```bash
npm start -- \
  --owner your-org \
  --repo your-app \
  --from 2024-01-01 \
  --to 2024-01-14 \
  --branches develop,feature/sprint-1 \
  --format markdown
```

## 📚 Additional Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Angular Update Guide](https://update.angular.io/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)

## 🎉 Conclusion

This tool provides comprehensive migration documentation for Angular applications by:

1. **Connecting to GitHub** using the REST API
2. **Analyzing commits and changes** within specified date ranges
3. **Tracking Angular-specific patterns** and dependencies
4. **Generating detailed reports** in multiple formats
5. **Providing migration guidance** with step-by-step instructions

The tool is production-ready and can handle large repositories with proper rate limiting and error handling.

**Next Steps:**
1. Run the installation script: `./scripts/install.sh`
2. Configure your GitHub token in `.env`
3. Start with interactive mode: `npm start -- --interactive`
4. Generate your first migration report!

Happy migration documentation! 🚀
