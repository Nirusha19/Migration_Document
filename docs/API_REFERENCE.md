# API Reference

## GitHubMigrationTool Class

The main class for connecting to GitHub and generating migration documentation.

### Constructor

```javascript
import { GitHubMigrationTool } from './src/GitHubMigrationTool.js';

const tool = new GitHubMigrationTool(config);
```

**Parameters:**
- `config` (Object): Configuration object

**Config Properties:**
- `token` (string): GitHub personal access token
- `owner` (string): Repository owner/organization
- `repo` (string): Repository name
- `fromDate` (string): Start date (YYYY-MM-DD)
- `toDate` (string): End date (YYYY-MM-DD)
- `branches` (Array): List of branch names to analyze
- `outputDir` (string): Output directory for reports
- `outputFormats` (Array): Output formats ['markdown', 'csv', 'json']

### Methods

#### generateMigrationReport()

Generates a comprehensive migration report.

```javascript
const report = await tool.generateMigrationReport();
```

**Returns:** Promise\<Object\> - Migration report object

**Report Structure:**
```javascript
{
  metadata: {
    repository: { /* repo info */ },
    generatedAt: "2024-01-15T14:30:22.000Z",
    dateRange: { from: "2023-01-01", to: "2024-01-01" },
    branches: ["main", "develop"],
    tool: "GitHub Migration Documentation Tool v1.0.0"
  },
  summary: {
    totalCommits: 150,
    filesChanged: 450,
    branchesAnalyzed: 2,
    dateRange: { from: "2023-01-01", to: "2024-01-01" }
  },
  commits: [/* array of commit objects */],
  fileChanges: [/* array of file change objects */],
  branches: [/* array of branch objects */],
  angular: {/* Angular-specific analysis */}
}
```

#### getRepositoryInfo()

Fetches repository information from GitHub.

```javascript
const repoInfo = await tool.getRepositoryInfo();
```

**Returns:** Promise\<Object\> - Repository information

#### getBranches()

Fetches branch information for configured branches.

```javascript
const branches = await tool.getBranches();
```

**Returns:** Promise\<Array\> - Array of branch objects

#### getCommitsInDateRange()

Fetches commits within the specified date range.

```javascript
const commits = await tool.getCommitsInDateRange();
```

**Returns:** Promise\<Array\> - Array of commit objects

#### getFileChanges(commits)

Analyzes file changes for the given commits.

```javascript
const fileChanges = await tool.getFileChanges(commits);
```

**Parameters:**
- `commits` (Array): Array of commit objects

**Returns:** Promise\<Array\> - Array of file change objects

#### getFileContent(filename, ref)

Fetches file content at a specific commit.

```javascript
const content = await tool.getFileContent('package.json', 'main');
```

**Parameters:**
- `filename` (string): Path to the file
- `ref` (string, optional): Git reference (branch, commit, tag)

**Returns:** Promise\<string|null\> - File content or null if not found

#### compareFiles(filename, fromRef, toRef)

Compares a file between two git references.

```javascript
const comparison = await tool.compareFiles('package.json', 'v1.0', 'v2.0');
```

**Parameters:**
- `filename` (string): Path to the file
- `fromRef` (string): Source git reference
- `toRef` (string): Target git reference

**Returns:** Promise\<Object|null\> - File comparison object

## ConfigManager Class

Handles configuration validation and parsing.

### Constructor

```javascript
import { ConfigManager } from './src/ConfigManager.js';

const config = new ConfigManager();
```

### Methods

#### buildConfig(options)

Builds configuration from options and environment variables.

```javascript
const finalConfig = await config.buildConfig(options);
```

**Parameters:**
- `options` (Object): Command line options

**Returns:** Promise\<Object\> - Complete configuration object

#### validateConfig(config)

Validates configuration object.

```javascript
const validation = config.validateConfig(finalConfig);
```

**Parameters:**
- `config` (Object): Configuration to validate

**Returns:** Object with `isValid` (boolean) and `errors` (Array)

## AngularAnalyzer Class

Analyzes Angular-specific changes and migration patterns.

### Constructor

```javascript
import { AngularAnalyzer } from './src/AngularAnalyzer.js';

const analyzer = new AngularAnalyzer(config);
```

### Methods

#### analyzeChanges(fileChanges)

Analyzes file changes for Angular-specific patterns.

```javascript
const angularChanges = await analyzer.analyzeChanges(fileChanges);
```

**Parameters:**
- `fileChanges` (Array): Array of file change objects

**Returns:** Promise\<Object\> - Angular analysis results

**Angular Analysis Structure:**
```javascript
{
  packageUpdates: 5,
  configChanges: 2,
  tsConfigChanges: 1,
  componentChanges: 15,
  serviceChanges: 8,
  moduleChanges: 3,
  migrationSteps: [/* migration steps */],
  dependencies: {
    added: [/* new dependencies */],
    removed: [/* removed dependencies */],
    updated: [/* updated dependencies */]
  },
  files: [/* Angular-specific file changes */],
  migrationPatterns: [/* detected patterns */]
}
```

#### isAngularFile(filename)

Checks if a file is Angular-related.

```javascript
const isAngular = analyzer.isAngularFile('src/app/app.component.ts');
```

**Parameters:**
- `filename` (string): File path

**Returns:** boolean - True if Angular-related

## ReportGenerator Class

Generates reports in various formats.

### Constructor

```javascript
import { ReportGenerator } from './src/ReportGenerator.js';

const generator = new ReportGenerator(config);
```

### Methods

#### generateReports(reportData)

Generates reports in all configured formats.

```javascript
await generator.generateReports(reportData);
```

**Parameters:**
- `reportData` (Object): Complete report data

**Returns:** Promise\<void\>

#### generateMarkdownReport(reportData)

Generates Markdown format reports.

```javascript
await generator.generateMarkdownReport(reportData);
```

#### generateCSVReport(reportData)

Generates CSV format reports.

```javascript
await generator.generateCSVReport(reportData);
```

#### generateJSONReport(reportData)

Generates JSON format reports.

```javascript
await generator.generateJSONReport(reportData);
```

## Data Structures

### Commit Object

```javascript
{
  sha: "a1b2c3d4e5f6...",
  message: "Add new feature",
  author: {
    name: "John Doe",
    email: "john@example.com",
    date: "2024-01-15T10:30:00Z"
  },
  committer: {
    name: "John Doe",
    email: "john@example.com",
    date: "2024-01-15T10:30:00Z"
  },
  url: "https://github.com/owner/repo/commit/a1b2c3d4e5f6...",
  branch: "main",
  stats: {
    additions: 10,
    deletions: 5,
    total: 15
  }
}
```

### File Change Object

```javascript
{
  filename: "src/app/app.component.ts",
  status: "modified", // added, modified, removed, renamed
  additions: 5,
  deletions: 2,
  changes: 7,
  patch: "@@ -1,3 +1,4 @@...", // Git diff patch
  sha: "a1b2c3d4e5f6...",
  commitMessage: "Update component",
  author: {
    name: "John Doe",
    email: "john@example.com",
    date: "2024-01-15T10:30:00Z"
  },
  branch: "main",
  url: "https://github.com/owner/repo/blob/sha/path"
}
```

### Branch Object

```javascript
{
  name: "main",
  sha: "a1b2c3d4e5f6...",
  url: "https://api.github.com/repos/owner/repo/commits/sha",
  protected: true
}
```

### Repository Object

```javascript
{
  name: "my-repo",
  fullName: "owner/my-repo",
  description: "Repository description",
  url: "https://github.com/owner/my-repo",
  defaultBranch: "main",
  language: "TypeScript",
  size: 1024,
  createdAt: "2020-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

## Error Handling

All methods throw descriptive errors that can be caught:

```javascript
try {
  const report = await tool.generateMigrationReport();
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    console.error('Check your GitHub token');
  } else if (error.message.includes('Rate limit')) {
    console.error('Rate limited, wait and retry');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Common Error Types

- **Authentication errors**: Invalid or missing GitHub token
- **Permission errors**: Insufficient repository access
- **Rate limit errors**: Too many API requests
- **Network errors**: Connection issues
- **Validation errors**: Invalid configuration

## Rate Limiting

The tool automatically handles GitHub API rate limits:
- Adds delays between requests
- Respects rate limit headers
- Provides informative error messages

Current limits:
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

## Examples

### Basic Usage

```javascript
import { GitHubMigrationTool } from './src/GitHubMigrationTool.js';

const tool = new GitHubMigrationTool({
  token: 'ghp_your_token',
  owner: 'angular',
  repo: 'angular',
  fromDate: '2023-01-01',
  toDate: '2024-01-01',
  branches: ['main', '16.x.x'],
  outputDir: './reports',
  outputFormats: ['markdown', 'json']
});

const report = await tool.generateMigrationReport();
console.log(`Generated report with ${report.summary.totalCommits} commits`);
```

### Advanced Analysis

```javascript
import { GitHubMigrationTool } from './src/GitHubMigrationTool.js';
import { AngularAnalyzer } from './src/AngularAnalyzer.js';

const tool = new GitHubMigrationTool(config);
const analyzer = new AngularAnalyzer(config);

// Get specific file changes
const commits = await tool.getCommitsInDateRange();
const fileChanges = await tool.getFileChanges(commits);

// Analyze Angular patterns
const angularChanges = await analyzer.analyzeChanges(fileChanges);

// Get specific file content
const packageJson = await tool.getFileContent('package.json');
const parsedPackage = JSON.parse(packageJson);

console.log('Angular version:', parsedPackage.dependencies['@angular/core']);
```
