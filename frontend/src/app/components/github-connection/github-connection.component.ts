import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GitHubService } from '../../services/github.service';

@Component({
  selector: 'app-github-connection',
  templateUrl: './github-connection.component.html',
  styleUrls: ['./github-connection.component.scss']
})
export class GitHubConnectionComponent implements OnInit {
  connectionForm: FormGroup;
  isConnecting = false;
  isConnected = false;
  connectedUser = '';

  constructor(
    private fb: FormBuilder,
    private githubService: GitHubService,
    private snackBar: MatSnackBar
  ) {
    this.connectionForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(40)]]
    });
  }

  ngOnInit(): void {
    // Check if already connected
    this.checkConnection();
  }

  async connect(): Promise<void> {
    if (this.connectionForm.valid) {
      this.isConnecting = true;
      const token = this.connectionForm.get('token')?.value;

      try {
        const response = await this.githubService.initializeGitHub(token).toPromise();
        this.isConnected = true;
        this.connectedUser = response.user;
        this.snackBar.open('Successfully connected to GitHub!', 'Close', {
          duration: 3000,
          panelClass: ['success-message']
        });
      } catch (error: any) {
        this.snackBar.open(`Connection failed: ${error.error?.details || error.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-message']
        });
      } finally {
        this.isConnecting = false;
      }
    }
  }

  disconnect(): void {
    this.isConnected = false;
    this.connectedUser = '';
    this.connectionForm.reset();
    this.snackBar.open('Disconnected from GitHub', 'Close', {
      duration: 3000
    });
  }

  private async checkConnection(): Promise<void> {
    try {
      await this.githubService.healthCheck().toPromise();
      // If health check passes, we might be connected
      // You could store connection state in localStorage or a service
    } catch (error) {
      console.log('Backend not available');
    }
  }

  getTokenHelpText(): string {
    return 'Enter your GitHub Personal Access Token. You can create one at https://github.com/settings/tokens';
  }
}