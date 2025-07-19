import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GitHubService } from '../../services/github.service';

@Component({
  selector: 'app-migration-form',
  templateUrl: './migration-form.component.html',
  styleUrls: ['./migration-form.component.scss']
})
export class MigrationFormComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<any>();

  migrationForm: FormGroup;
  isGenerating = false;
  documentFormats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' }
  ];

  constructor(
    private fb: FormBuilder,
    private githubService: GitHubService,
    private snackBar: MatSnackBar
  ) {
    this.migrationForm = this.fb.group({
      gitUrl: ['', [Validators.required, Validators.pattern(/^https:\/\/github\.com\/[^\/]+\/[^\/]+/)]],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      format: ['pdf', Validators.required],
      includeDetails: [true]
    });
  }

  ngOnInit(): void {
    // Set default dates (last 30 days)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    this.migrationForm.patchValue({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0]
    });
  }

  async generateMigration(): Promise<void> {
    if (this.migrationForm.valid) {
      this.isGenerating = true;
      const formData = this.migrationForm.value;

      try {
        // Validate GitHub URL
        const urlInfo = this.githubService.parseGitHubUrl(formData.gitUrl);
        if (!urlInfo) {
          throw new Error('Invalid GitHub URL format');
        }

        const request = {
          gitUrl: formData.gitUrl,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          format: formData.format,
          includeDetails: formData.includeDetails
        };

        const response = await this.githubService.generateMigrationDocument(request).toPromise();
        
        this.snackBar.open('Migration document generated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-message']
        });

        // Emit the response to parent component
        this.formSubmitted.emit(response);

      } catch (error: any) {
        this.snackBar.open(`Failed to generate document: ${error.error?.details || error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-message']
        });
      } finally {
        this.isGenerating = false;
      }
    }
  }

  validateDateRange(): void {
    const fromDate = this.migrationForm.get('fromDate')?.value;
    const toDate = this.migrationForm.get('toDate')?.value;

    if (fromDate && toDate && fromDate > toDate) {
      this.migrationForm.get('toDate')?.setErrors({ invalidRange: true });
    } else {
      this.migrationForm.get('toDate')?.setErrors(null);
    }
  }

  getGitUrlError(): string {
    const control = this.migrationForm.get('gitUrl');
    if (control?.hasError('required')) {
      return 'GitHub URL is required';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid GitHub URL (e.g., https://github.com/owner/repo)';
    }
    return '';
  }

  getDateRangeError(): string {
    const control = this.migrationForm.get('toDate');
    if (control?.hasError('invalidRange')) {
      return 'End date must be after start date';
    }
    return '';
  }
}