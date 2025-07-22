# GitHub Migration Tool - Setup Guide

## Quick Start (5 minutes)

### 1. Prerequisites Check
```bash
# Check Node.js version (requires 16+)
node --version

# Check npm version
npm --version

# Check git installation
git --version
```

### 2. GitHub Token Setup
1. Go to [GitHub Personal Access Tokens](https://github.com/settings/personal-access-tokens/tokens)
2. Click "Generate new token (classic)"
3. Set expiration (recommend 90 days)
4. Select scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:org` - Read org and team membership
   - ✅ `user:email` - Access user email addresses
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 3. Project Setup
```bash
# Clone or download the project
cd github-migration-documentation-tool

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 4. Configure Environment
Edit `.env` file with your settings:
```bash
# Required
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-org-or-username
GITHUB_REPO=your-repository-name

# Optional (adjust as needed)
FROM_DATE=2023-01-01
TO_DATE=2024-12-31
BRANCHES=main,develop
OUTPUT_DIR=./migration-docs
OUTPUT_FORMAT=markdown,csv,json
```

### 5. Test Run
```bash
# Run interactive mode
npm start -- --interactive
```

## Detailed Configuration

### Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` | ✅ |
| `GITHUB_OWNER` | Repository owner/organization | `microsoft` | ✅ |
| `GITHUB_REPO` | Repository name | `vscode` | ✅ |
| `FROM_DATE` | Analysis start date | `2023-01-01` | ❌ |
| `TO_DATE` | Analysis end date | `2024-12-31` | ❌ |
| `BRANCHES` | Branches to analyze (comma-separated) | `main,develop,feature/xyz` | ❌ |
| `OUTPUT_DIR` | Output directory for reports | `./migration-docs` | ❌ |
| `OUTPUT_FORMAT` | Output formats (comma-separated) | `markdown,csv,json` | ❌ |
| `ANGULAR_VERSION_FROM` | Angular version migrating from | `12` | ❌ |
| `ANGULAR_VERSION_TO` | Angular version migrating to | `17` | ❌ |

### Command Line Options

```bash
# Basic usage
npm start

# Specify repository
npm start -- --owner microsoft --repo vscode

# Set date range
npm start -- --from 2023-01-01 --to 2024-01-01

# Analyze specific branches
npm start -- --branches main,develop,feature/angular-17

# Choose output formats
npm start -- --format markdown,csv

# Set output directory
npm start -- --output-dir ./my-reports

# Interactive mode
npm start -- --interactive

# Angular migration analysis
npm start -- --angular-from 12 --angular-to 17

# Full example
npm start -- \
  --owner angular \
  --repo angular \
  --from 2023-01-01 \
  --to 2024-01-01 \
  --branches main,16.x.x,17.x.x \
  --format markdown,json \
  --output-dir ./angular-migration \
  --angular-from 16 \
  --angular-to 17
```

## Common Use Cases

### 1. Angular Version Migration Analysis
```bash
# Analyze Angular CLI updates
npm start -- \
  --owner angular \
  --repo angular-cli \
  --from 2023-01-01 \
  --to 2024-01-01 \
  --branches main \
  --angular-from 15 \
  --angular-to 17
```

### 2. Feature Branch Analysis
```bash
# Compare feature branch with main
npm start -- \
  --owner your-org \
  --repo your-app \
  --branches main,feature/migration \
  --from 2023-06-01 \
  --to 2023-12-31
```

### 3. Multi-Branch Migration Tracking
```bash
# Track changes across multiple release branches
npm start -- \
  --owner your-org \
  --repo your-app \
  --branches main,release/v1.0,release/v2.0,develop \
  --from 2023-01-01 \
  --to 2024-01-01
```

### 4. Historical Analysis
```bash
# Analyze long-term changes
npm start -- \
  --owner facebook \
  --repo react \
  --from 2022-01-01 \
  --to 2024-01-01 \
  --branches main \
  --format json
```

## Troubleshooting

### Issue: "Authentication failed"
**Cause:** Invalid or expired GitHub token
**Solution:**
1. Check token validity at [GitHub Settings](https://github.com/settings/personal-access-tokens/tokens)
2. Verify token has correct scopes (`repo`, `read:org`, `user:email`)
3. Generate new token if expired

### Issue: "Repository not found"
**Cause:** Incorrect owner/repo or insufficient permissions
**Solution:**
1. Verify repository exists: `https://github.com/OWNER/REPO`
2. Check token has access to the repository
3. For private repos, ensure token has `repo` scope

### Issue: "Rate limit exceeded"
**Cause:** Too many API requests
**Solution:**
1. Wait for rate limit reset (usually 1 hour)
2. Use authenticated requests (token provides higher limits)
3. Reduce date range or number of branches

### Issue: "No commits found"
**Cause:** Date range or branch filters too restrictive
**Solution:**
1. Expand date range
2. Verify branch names are correct
3. Check if repository has commits in the specified period

### Issue: "Module not found"
**Cause:** Dependencies not installed
**Solution:**
```bash
npm install
```

### Issue: "Permission denied" for output directory
**Cause:** Insufficient file system permissions
**Solution:**
```bash
# Create directory manually
mkdir -p ./migration-docs

# Or use different output directory
npm start -- --output-dir ~/Documents/migration-docs
```

## Performance Tips

### For Large Repositories
1. **Use specific date ranges:**
   ```bash
   npm start -- --from 2024-01-01 --to 2024-03-31
   ```

2. **Limit branches:**
   ```bash
   npm start -- --branches main,develop
   ```

3. **Use JSON format for processing:**
   ```bash
   npm start -- --format json
   ```

### For Multiple Repositories
Create a script to process multiple repositories:
```bash
#!/bin/bash
repos=("repo1" "repo2" "repo3")
for repo in "${repos[@]}"; do
  npm start -- --repo "$repo" --output-dir "./reports/$repo"
done
```

## Advanced Configuration

### Custom Report Templates
The tool generates standard reports, but you can customize the output by modifying:
- `src/ReportGenerator.js` - Report generation logic
- `src/AngularAnalyzer.js` - Angular-specific analysis

### API Rate Limits
GitHub API rate limits:
- **Unauthenticated:** 60 requests per hour
- **Authenticated:** 5,000 requests per hour
- **GitHub Enterprise:** Higher limits

The tool automatically handles rate limiting with built-in delays.

### Large Repository Handling
For repositories with >10,000 commits:
1. Use shorter date ranges (3-6 months)
2. Focus on specific branches
3. Consider using GitHub's GraphQL API for complex queries

## Security Best Practices

1. **Token Security:**
   - Never commit tokens to version control
   - Use environment variables or `.env` files
   - Set token expiration dates
   - Rotate tokens regularly

2. **Permissions:**
   - Use minimum required scopes
   - Consider read-only tokens for analysis
   - Review token usage regularly

3. **Data Handling:**
   - Be aware that commit data may contain sensitive information
   - Secure generated reports appropriately
   - Consider data retention policies

## Support

If you encounter issues not covered here:
1. Check the main [README.md](../README.md)
2. Search [GitHub Issues](https://github.com/your-repo/issues)
3. Create a new issue with:
   - Error message
   - Command used
   - Node.js version
   - Operating system
