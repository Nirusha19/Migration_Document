import dotenv from 'dotenv';
import path from 'path';
import moment from 'moment';

export class ConfigManager {
  constructor() {
    dotenv.config();
  }

  async buildConfig(options = {}) {
    const config = {
      // GitHub Configuration
      token: options.token || process.env.GITHUB_TOKEN,
      owner: options.owner || process.env.GITHUB_OWNER,
      repo: options.repo || process.env.GITHUB_REPO,

      // Date Range
      fromDate: options.from || process.env.FROM_DATE || '2023-01-01',
      toDate: options.to || process.env.TO_DATE || moment().format('YYYY-MM-DD'),

      // Branches
      branches: this.parseBranches(options.branches || process.env.BRANCHES || 'main'),

      // Output Configuration
      outputDir: options.outputDir || process.env.OUTPUT_DIR || './migration-docs',
      outputFormats: this.parseOutputFormats(options.format || process.env.OUTPUT_FORMAT || 'markdown,csv'),

      // Angular Configuration
      angularVersionFrom: options.angularFrom || process.env.ANGULAR_VERSION_FROM,
      angularVersionTo: options.angularTo || process.env.ANGULAR_VERSION_TO,
      includeDependencies: this.parseBoolean(process.env.INCLUDE_DEPENDENCIES, true),
      includeConfigChanges: this.parseBoolean(process.env.INCLUDE_CONFIG_CHANGES, true)
    };

    return config;
  }

  validateConfig(config) {
    const errors = [];

    // Required fields
    if (!config.token) {
      errors.push('GitHub token is required. Set GITHUB_TOKEN environment variable or use --token option.');
    }

    if (!config.owner) {
      errors.push('GitHub repository owner is required. Set GITHUB_OWNER environment variable or use --owner option.');
    }

    if (!config.repo) {
      errors.push('GitHub repository name is required. Set GITHUB_REPO environment variable or use --repo option.');
    }

    // Date validation
    if (!moment(config.fromDate, 'YYYY-MM-DD', true).isValid()) {
      errors.push('Invalid from date format. Use YYYY-MM-DD format.');
    }

    if (!moment(config.toDate, 'YYYY-MM-DD', true).isValid()) {
      errors.push('Invalid to date format. Use YYYY-MM-DD format.');
    }

    if (moment(config.fromDate).isAfter(moment(config.toDate))) {
      errors.push('From date cannot be after to date.');
    }

    // Branches validation
    if (!Array.isArray(config.branches) || config.branches.length === 0) {
      errors.push('At least one branch must be specified.');
    }

    // Output formats validation
    const validFormats = ['markdown', 'csv', 'json'];
    const invalidFormats = config.outputFormats.filter(format => !validFormats.includes(format));
    if (invalidFormats.length > 0) {
      errors.push(`Invalid output formats: ${invalidFormats.join(', ')}. Valid formats: ${validFormats.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  parseBranches(branchString) {
    if (Array.isArray(branchString)) {
      return branchString;
    }
    
    return branchString
      .split(',')
      .map(branch => branch.trim())
      .filter(branch => branch.length > 0);
  }

  parseOutputFormats(formatString) {
    if (Array.isArray(formatString)) {
      return formatString;
    }
    
    return formatString
      .split(',')
      .map(format => format.trim().toLowerCase())
      .filter(format => format.length > 0);
  }

  parseBoolean(value, defaultValue = false) {
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    }
    
    return defaultValue;
  }

  getAbsolutePath(relativePath) {
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }
    return path.resolve(process.cwd(), relativePath);
  }
}
