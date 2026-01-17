import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  
   private baseUrl = environment.apiUrl + 'api/reports';
  
  constructor(private http: HttpClient) { }

  /**
   * Generate and download boarding report PDF
   */
  downloadBoardingReport(flightId: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    
    return this.http.get(`${this.baseUrl}/boarding/${flightId}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download reconciliation report PDF
   */
  downloadReconciliationReport(flightId: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    
    return this.http.get(`${this.baseUrl}/reconciliation/${flightId}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download final manifest PDF
   */
  downloadFinalManifest(flightId: number): Observable<Blob> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });
    
    return this.http.get(`${this.baseUrl}/${flightId}/report/final-manifest`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  /**
   * Save blob as PDF file
   */
  saveAsPdf(blob: Blob, filename: string): void {
    saveAs(blob, filename);
  }

  /**
   * Open PDF in new tab (for preview)
   */
  previewPdf(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  /**
   * Download boarding report with automatic filename
   */
  async downloadBoardingReportWithProgress(flightId: number, flightNumber: string): Promise<void> {
    try {
      this.downloadBoardingReport(flightId).subscribe({
        next: (blob: Blob) => {
          const filename = `boarding-report-${flightNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
          this.saveAsPdf(blob, filename);
        },
        error: (error) => {
          console.error('Error downloading boarding report:', error);
          // Handle error - show toast or alert
        }
      });
    } catch (error) {
      console.error('Error in download process:', error);
    }
  }

  /**
   * Download reconciliation report with progress indicator
   */
  async downloadReconciliationReportWithProgress(flightId: number, flightNumber: string): Promise<void> {
    try {
      this.downloadReconciliationReport(flightId).subscribe({
        next: (blob: Blob) => {
          const filename = `reconciliation-report-${flightNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
          this.saveAsPdf(blob, filename);
        },
        error: (error) => {
          console.error('Error downloading reconciliation report:', error);
          // Handle error
        }
      });
    } catch (error) {
      console.error('Error in download process:', error);
    }
  }
}