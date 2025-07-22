import path from 'path';
import chalk from 'chalk';

export class AngularAnalyzer {
  constructor(config) {
    this.config = config;
    this.angularFiles = [
      'package.json',
      'angular.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.spec.json',
      'karma.conf.js',
      'protractor.conf.js',
      'e2e/protractor.conf.js',
      'src/main.ts',
      'src/polyfills.ts',
      'src/app/app.module.ts',
      'src/app/app.component.ts',
      'src/environments/environment.ts',
      'src/environments/environment.prod.ts'
    ];
  }

  async analyzeChanges(fileChanges) {
    const angularChanges = {
      packageUpdates: 0,
      configChanges: 0,
      tsConfigChanges: 0,
      componentChanges: 0,
      serviceChanges: 0,
      moduleChanges: 0,
      migrationSteps: [],
      dependencies: {
        added: [],
        removed: [],
        updated: []
      },
      files: []
    };

    // Filter Angular-specific file changes
    const angularFileChanges = fileChanges.filter(change => 
      this.isAngularFile(change.filename)
    );

    angularChanges.files = angularFileChanges;

    for (const change of angularFileChanges) {
      this.analyzeFileChange(change, angularChanges);
    }

    // Detect migration patterns
    await this.detectMigrationPatterns(angularFileChanges, angularChanges);

    // Generate migration steps
    this.generateMigrationSteps(angularChanges);

    return angularChanges;
  }

  isAngularFile(filename) {
    // Check if it's a core Angular file
    if (this.angularFiles.some(file => filename.endsWith(file))) {
      return true;
    }

    // Check if it's an Angular component, service, module, etc.
    const angularPatterns = [
      /\.component\.(ts|html|css|scss)$/,
      /\.service\.ts$/,
      /\.module\.ts$/,
      /\.directive\.ts$/,
      /\.pipe\.ts$/,
      /\.guard\.ts$/,
      /\.interceptor\.ts$/,
      /\.resolver\.ts$/,
      /\.spec\.ts$/,
      /src\/app\//,
      /src\/environments\//
    ];

    return angularPatterns.some(pattern => pattern.test(filename));
  }

  analyzeFileChange(change, angularChanges) {
    const filename = change.filename;

    if (filename.endsWith('package.json')) {
      angularChanges.packageUpdates++;
      this.analyzePackageJsonChanges(change, angularChanges);
    } else if (filename.endsWith('angular.json')) {
      angularChanges.configChanges++;
    } else if (filename.includes('tsconfig')) {
      angularChanges.tsConfigChanges++;
    } else if (filename.includes('.component.')) {
      angularChanges.componentChanges++;
    } else if (filename.includes('.service.')) {
      angularChanges.serviceChanges++;
    } else if (filename.includes('.module.')) {
      angularChanges.moduleChanges++;
    }
  }

  analyzePackageJsonChanges(change, angularChanges) {
    if (!change.patch) return;

    const lines = change.patch.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('+') && line.includes('"@angular/')) {
        const match = line.match(/"(@angular\/[^"]+)":\s*"([^"]+)"/);
        if (match) {
          angularChanges.dependencies.added.push({
            package: match[1],
            version: match[2],
            commit: change.sha,
            date: change.date
          });
        }
      } else if (line.startsWith('-') && line.includes('"@angular/')) {
        const match = line.match(/"(@angular\/[^"]+)":\s*"([^"]+)"/);
        if (match) {
          angularChanges.dependencies.removed.push({
            package: match[1],
            version: match[2],
            commit: change.sha,
            date: change.date
          });
        }
      }
    }
  }

  async detectMigrationPatterns(fileChanges, angularChanges) {
    const patterns = {
      'Angular CLI Migration': fileChanges.some(change => 
        change.commitMessage.toLowerCase().includes('ng update') ||
        change.commitMessage.toLowerCase().includes('angular cli')
      ),
      'TypeScript Update': fileChanges.some(change => 
        change.filename.includes('tsconfig') &&
        change.patch && change.patch.includes('"target"')
      ),
      'Package Updates': angularChanges.packageUpdates > 0,
      'Configuration Changes': angularChanges.configChanges > 0,
      'Component Modernization': fileChanges.some(change =>
        change.filename.includes('.component.') &&
        change.patch && (
          change.patch.includes('OnPush') ||
          change.patch.includes('standalone') ||
          change.patch.includes('inject(')
        )
      ),
      'Router Updates': fileChanges.some(change =>
        change.filename.includes('routing') ||
        (change.patch && change.patch.includes('RouterModule'))
      ),
      'RxJS Updates': fileChanges.some(change =>
        change.patch && (
          change.patch.includes('rxjs/operators') ||
          change.patch.includes('pipe(')
        )
      )
    };

    angularChanges.migrationPatterns = Object.entries(patterns)
      .filter(([pattern, detected]) => detected)
      .map(([pattern]) => pattern);
  }

  generateMigrationSteps(angularChanges) {
    const steps = [];

    if (angularChanges.packageUpdates > 0) {
      steps.push({
        step: 1,
        title: 'Update Angular Dependencies',
        description: 'Update Angular core packages and dependencies',
        files: angularChanges.files.filter(f => f.filename.endsWith('package.json')),
        commands: ['npm update', 'ng update @angular/core @angular/cli']
      });
    }

    if (angularChanges.configChanges > 0) {
      steps.push({
        step: steps.length + 1,
        title: 'Update Angular Configuration',
        description: 'Update angular.json and build configurations',
        files: angularChanges.files.filter(f => f.filename.endsWith('angular.json')),
        commands: ['ng update @angular/cli']
      });
    }

    if (angularChanges.tsConfigChanges > 0) {
      steps.push({
        step: steps.length + 1,
        title: 'Update TypeScript Configuration',
        description: 'Update TypeScript configuration files',
        files: angularChanges.files.filter(f => f.filename.includes('tsconfig')),
        commands: ['npm run build', 'npm run test']
      });
    }

    if (angularChanges.componentChanges > 0) {
      steps.push({
        step: steps.length + 1,
        title: 'Update Components',
        description: 'Migrate components to use new Angular patterns',
        files: angularChanges.files.filter(f => f.filename.includes('.component.')),
        commands: ['ng lint', 'ng test']
      });
    }

    angularChanges.migrationSteps = steps;
  }

  generateAngularReport(angularChanges) {
    let report = '# Angular Migration Report\n\n';

    report += '## Summary\n\n';
    report += `- Package.json updates: ${angularChanges.packageUpdates}\n`;
    report += `- Angular.json changes: ${angularChanges.configChanges}\n`;
    report += `- TypeScript config updates: ${angularChanges.tsConfigChanges}\n`;
    report += `- Component changes: ${angularChanges.componentChanges}\n`;
    report += `- Service changes: ${angularChanges.serviceChanges}\n`;
    report += `- Module changes: ${angularChanges.moduleChanges}\n\n`;

    if (angularChanges.migrationPatterns.length > 0) {
      report += '## Detected Migration Patterns\n\n';
      angularChanges.migrationPatterns.forEach(pattern => {
        report += `- ${pattern}\n`;
      });
      report += '\n';
    }

    if (angularChanges.dependencies.added.length > 0) {
      report += '## Dependencies Added\n\n';
      angularChanges.dependencies.added.forEach(dep => {
        report += `- ${dep.package}@${dep.version} (${dep.date})\n`;
      });
      report += '\n';
    }

    if (angularChanges.dependencies.removed.length > 0) {
      report += '## Dependencies Removed\n\n';
      angularChanges.dependencies.removed.forEach(dep => {
        report += `- ${dep.package}@${dep.version} (${dep.date})\n`;
      });
      report += '\n';
    }

    if (angularChanges.migrationSteps.length > 0) {
      report += '## Migration Steps\n\n';
      angularChanges.migrationSteps.forEach(step => {
        report += `### Step ${step.step}: ${step.title}\n\n`;
        report += `${step.description}\n\n`;
        if (step.commands.length > 0) {
          report += 'Commands to run:\n';
          step.commands.forEach(cmd => {
            report += `\`\`\`bash\n${cmd}\n\`\`\`\n`;
          });
        }
        report += '\n';
      });
    }

    return report;
  }
}
