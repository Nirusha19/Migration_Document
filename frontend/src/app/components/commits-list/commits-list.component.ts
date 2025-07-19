import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GitHubService } from '../../services/github.service';

@Component({
  selector: 'app-commits-list',
  templateUrl: './commits-list.component.html',
  styleUrls: ['./commits-list.component.scss']
})
export class CommitsListComponent implements OnInit {
  @Input() gitUrl: string = '';
  @Input() fromDate: string = '';
  @Input() toDate: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['sha', 'message', 'author', 'date'];
  dataSource = new MatTableDataSource<any>([]);
  
  isLoading = false;
  error: string = '';
  totalCommits = 0;

  constructor(private githubService: GitHubService) {}

  ngOnInit(): void {
    if (this.gitUrl && this.fromDate && this.toDate) {
      this.loadCommits();
    }
  }

  async loadCommits(): Promise<void> {
    if (!this.gitUrl || !this.fromDate || !this.toDate) return;

    this.isLoading = true;
    this.error = '';

    try {
      const urlInfo = this.githubService.parseGitHubUrl(this.gitUrl);
      if (!urlInfo) {
        throw new Error('Invalid GitHub URL format');
      }

      const response = await this.githubService.getCommits(
        urlInfo.owner, 
        urlInfo.repo, 
        this.fromDate, 
        this.toDate
      ).toPromise();

      this.dataSource.data = response.commits;
      this.totalCommits = response.total;
      this.setupTable();
    } catch (error: any) {
      this.error = error.error?.details || error.message || 'Failed to load commits';
    } finally {
      this.isLoading = false;
    }
  }

  private setupTable(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter for commit messages
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.commit.message.toLowerCase().includes(searchStr) ||
             data.commit.author.name.toLowerCase().includes(searchStr) ||
             data.sha.toLowerCase().includes(searchStr);
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getShortSha(sha: string): string {
    return sha.substring(0, 8);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getCommitMessage(message: string): string {
    // Truncate long commit messages
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  }

  getAuthorName(author: any): string {
    return author.name || author.email || 'Unknown';
  }
}