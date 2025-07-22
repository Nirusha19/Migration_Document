#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import { GitHubMigrationTool } from './GitHubMigrationTool.js';
import { ConfigManager } from './ConfigManager.js';

// Load environment variables
dotenv.config();

const VERSION = '1.0.0';

program
  .name('github-migration-tool')
  .description('Generate migration documentation from GitHub repositories')
  .version(VERSION);

program
  .option('-o, --owner <owner>', 'GitHub repository owner')
  .option('-r, --repo <repo>', 'GitHub repository name')
  .option('-t, --token <token>', 'GitHub personal access token')
  .option('-f, --from <date>', 'Start date (YYYY-MM-DD)')
  .option('-T, --to <date>', 'End date (YYYY-MM-DD)')
  .option('-b, --branches <branches>', 'Comma-separated list of branches')
  .option('--format <formats>', 'Output formats (markdown,csv,json)')
  .option('--output-dir <dir>', 'Output directory')
  .option('-i, --interactive', 'Run in interactive mode')
  .option('--angular-from <version>', 'Angular version migrating from')
  .option('--angular-to <version>', 'Angular version migrating to')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold(`\n🚀 GitHub Migration Documentation Tool v${VERSION}\n`));

      const config = new ConfigManager();
      
      let finalConfig;
      
      if (options.interactive) {
        finalConfig = await runInteractiveMode(config);
      } else {
        finalConfig = await config.buildConfig(options);
      }

      const validation = config.validateConfig(finalConfig);
      if (!validation.isValid) {
        console.error(chalk.red('❌ Configuration validation failed:'));
        validation.errors.forEach(error => console.error(chalk.red(`  • ${error}`)));
        process.exit(1);
      }

      const migrationTool = new GitHubMigrationTool(finalConfig);

      console.log(chalk.green('✅ Configuration validated successfully'));
      console.log(chalk.blue('📊 Starting migration analysis...'));

      const report = await migrationTool.generateMigrationReport();

      console.log(chalk.green('\n🎉 Migration documentation generated successfully!'));
      console.log(chalk.yellow(`📁 Output location: ${finalConfig.outputDir}`));
      
      displaySummary(report);

    } catch (error) {
      console.error(chalk.red('\n❌ Error occurred:'), error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

async function runInteractiveMode(config) {
  console.log(chalk.cyan('🔧 Interactive Configuration Mode\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'owner',
      message: 'GitHub repository owner:',
      default: process.env.GITHUB_OWNER,
      validate: input => input.trim() !== '' || 'Repository owner is required'
    },
    {
      type: 'input',
      name: 'repo',
      message: 'GitHub repository name:',
      default: process.env.GITHUB_REPO,
      validate: input => input.trim() !== '' || 'Repository name is required'
    },
    {
      type: 'password',
      name: 'token',
      message: 'GitHub personal access token:',
      default: process.env.GITHUB_TOKEN,
      validate: input => input.trim() !== '' || 'GitHub token is required'
    },
    {
      type: 'input',
      name: 'fromDate',
      message: 'Start date (YYYY-MM-DD):',
      default: process.env.FROM_DATE || '2023-01-01',
      validate: input => {
        const date = new Date(input);
        return !isNaN(date.getTime()) || 'Please enter a valid date (YYYY-MM-DD)';
      }
    },
    {
      type: 'input',
      name: 'toDate',
      message: 'End date (YYYY-MM-DD):',
      default: process.env.TO_DATE || new Date().toISOString().split('T')[0],
      validate: input => {
        const date = new Date(input);
        return !isNaN(date.getTime()) || 'Please enter a valid date (YYYY-MM-DD)';
      }
    },
    {
      type: 'input',
      name: 'branches',
      message: 'Branches to analyze (comma-separated):',
      default: process.env.BRANCHES || 'main',
      validate: input => input.trim() !== '' || 'At least one branch is required'
    },
    {
      type: 'checkbox',
      name: 'outputFormats',
      message: 'Select output formats:',
      choices: [
        { name: 'Markdown', value: 'markdown', checked: true },
        { name: 'CSV', value: 'csv', checked: true },
        { name: 'JSON', value: 'json', checked: false }
      ],
      validate: input => input.length > 0 || 'At least one output format is required'
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      default: process.env.OUTPUT_DIR || './migration-docs'
    }
  ]);

  return config.buildConfig({
    owner: answers.owner,
    repo: answers.repo,
    token: answers.token,
    from: answers.fromDate,
    to: answers.toDate,
    branches: answers.branches,
    format: answers.outputFormats.join(','),
    outputDir: answers.outputDir
  });
}

function displaySummary(report) {
  console.log(chalk.cyan('\n📋 Migration Report Summary:'));
  console.log(chalk.white(`  • Total Commits Analyzed: ${report.summary.totalCommits}`));
  console.log(chalk.white(`  • Files Changed: ${report.summary.filesChanged}`));
  console.log(chalk.white(`  • Branches Analyzed: ${report.summary.branchesAnalyzed}`));
  console.log(chalk.white(`  • Date Range: ${report.summary.dateRange.from} to ${report.summary.dateRange.to}`));
  
  if (report.angular) {
    console.log(chalk.yellow('\n🅰️  Angular-Specific Changes:'));
    console.log(chalk.white(`  • Package.json updates: ${report.angular.packageUpdates}`));
    console.log(chalk.white(`  • Angular.json changes: ${report.angular.configChanges}`));
    console.log(chalk.white(`  • TypeScript config updates: ${report.angular.tsConfigChanges}`));
  }
}

program.parse();
