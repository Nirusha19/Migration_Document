import { Component, Input } from '@angular/core';
import { GitHubService } from '../../services/github.service';

@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss']
})
export class DocumentPreviewComponent {
  @Input() generatedDocument: any = null;

  isDownloading = false;

  constructor(private githubService: GitHubService) {}

  async downloadDocument(): Promise<void> {
    if (!this.generatedDocument?.documentPath) return;

    this.isDownloading = true;

    try {
      const blob = await this.githubService.downloadDocument(this.generatedDocument.documentPath).toPromise();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.generatedDocument.documentPath;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download failed:', error);
    } finally {
      this.isDownloading = false;
    }
  }

  getDocumentType(): string {
    if (!this.generatedDocument?.documentPath) return '';
    
    const extension = this.generatedDocument.documentPath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'xlsx':
        return 'Excel Spreadsheet';
      default:
        return 'Document';
    }
  }

  getDocumentIcon(): string {
    if (!this.generatedDocument?.documentPath) return 'description';
    
    const extension = this.generatedDocument.documentPath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'xlsx':
        return 'table_chart';
      default:
        return 'description';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}