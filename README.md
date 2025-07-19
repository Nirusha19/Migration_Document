# GitHub Migration Tool

A comprehensive tool for generating migration documents from GitHub repositories. This application connects to GitHub Desktop/GitHub API to retrieve repository data and create detailed migration reports in PDF or Excel format.

## Features

- 🔗 **GitHub Integration**: Connect to GitHub using Personal Access Tokens
- 📊 **Repository Analysis**: Get detailed repository information including branches, commits, and statistics
- 📅 **Date Range Filtering**: Filter commits by specific date ranges
- 📄 **Document Generation**: Generate migration documents in PDF or Excel format
- 🔍 **Commit History**: View and search through commit history with detailed information
- 📱 **Modern UI**: Beautiful, responsive Angular Material interface
- ⚡ **Real-time Updates**: Live data fetching and document generation

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Angular CLI** (v16 or higher)
- **Git** (for version control)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd github-migration-tool
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development
DOCUMENTS_DIR=./documents
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

### 5. Create Documents Directory

```bash
mkdir documents
```

## Running the Application

### Development Mode

1. **Start the Backend Server** (Terminal 1):
```bash
npm run dev
```

2. **Start the Frontend Application** (Terminal 2):
```bash
cd frontend
npm start
```

3. **Access the Application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

### Production Mode

1. **Build the Frontend**:
```bash
cd frontend
npm run build
cd ..
```

2. **Start the Production Server**:
```bash
npm start
```

## GitHub Token Setup

To use this tool, you need a GitHub Personal Access Token:

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` - Full control of private repositories
   - `read:org` - Read organization data
4. Copy the generated token
5. Use this token in the application's GitHub connection form

## Usage Guide

### 1. Connect to GitHub

1. Open the application in your browser
2. Enter your GitHub Personal Access Token
3. Click "Connect to GitHub"
4. Verify the connection is successful

### 2. Generate Migration Document

1. **Enter Repository URL**: Provide the full GitHub repository URL
   - Example: `https://github.com/owner/repository`

2. **Set Date Range**: Choose the from and to dates for the migration period
   - Default: Last 30 days

3. **Select Format**: Choose between PDF or Excel format

4. **Generate Document**: Click "Generate Migration Document"

### 3. Download and Review

1. Once generated, the document will be available for download
2. Click "Download Document" to save the file
3. Open the document with the appropriate application:
   - **PDF**: Adobe Reader, Chrome, Firefox, or any PDF viewer
   - **Excel**: Microsoft Excel, Google Sheets, or LibreOffice Calc

## Document Contents

The generated migration documents include:

### Repository Information
- Repository name and description
- Primary programming language
- Star and fork counts
- Repository size and last update

### Branch Details
- List of all branches
- Latest commit SHA for each branch
- Default branch information

### Commit History
- All commits within the specified date range
- Commit messages and authors
- Timestamps and SHA hashes
- Detailed commit information

### Migration Summary
- Total number of commits
- Date range covered
- Generation timestamp
- Repository statistics

## API Endpoints

### Backend API (Port 3000)

- `GET /api/health` - Health check
- `POST /api/init-github` - Initialize GitHub connection
- `GET /api/repository/:owner/:repo` - Get repository information
- `GET /api/commits/:owner/:repo` - Get commits between dates
- `POST /api/generate-migration` - Generate migration document
- `GET /api/download/:filename` - Download generated document

## Project Structure

```
github-migration-tool/
├── server.js                 # Main Express server
├── package.json              # Backend dependencies
├── .env.example             # Environment configuration example
├── documents/               # Generated documents storage
├── frontend/                # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Angular components
│   │   │   ├── services/    # API services
│   │   │   └── app.module.ts
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── package.json         # Frontend dependencies
│   └── angular.json         # Angular configuration
└── README.md               # This file
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Octokit** - GitHub API client
- **PDFKit** - PDF generation
- **ExcelJS** - Excel file generation
- **Moment.js** - Date handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **Angular 16** - Frontend framework
- **Angular Material** - UI components
- **TypeScript** - Programming language
- **RxJS** - Reactive programming
- **SCSS** - Styling

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the backend is running and CORS is properly configured
2. **GitHub Token Issues**: Verify your token has the correct permissions
3. **Port Conflicts**: Change the port in `.env` if 3000 or 4200 are in use
4. **Document Generation Fails**: Check that the documents directory exists and is writable

### Error Messages

- **"GitHub not initialized"**: Connect to GitHub first
- **"Invalid GitHub URL"**: Use the full repository URL format
- **"Failed to fetch repository data"**: Check repository permissions and token validity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the GitHub API documentation

## Changelog

### Version 1.0.0
- Initial release
- GitHub API integration
- PDF and Excel document generation
- Angular Material UI
- Date range filtering
- Commit history viewing