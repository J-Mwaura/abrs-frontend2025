import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
  IonIcon, IonLabel, IonButton, IonBadge, IonSpinner,
  IonSearchbar, IonListHeader, IonToast, IonFab, IonFabButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonSegment, IonItemOptions, IonItemOption, IonItemSliding, IonSegmentButton,
  IonChip, AlertController, LoadingController, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import {
  searchOutline, checkmarkCircleOutline, logInOutline,
  arrowUpOutline, arrowDownOutline,
  personOutline, checkmarkDoneOutline,
  arrowUndoOutline, analyticsOutline, alertOutline,
  lockClosedOutline, documentTextOutline, refreshOutline,
  eyeOutline, downloadOutline, receiptOutline
} from 'ionicons/icons';
import { BoardingSequence, BoardingStatus } from 'src/app/models/boarding-sequence';
import { BoardingService } from 'src/app/services/boarding-service';
import { FlightService } from 'src/app/services/flight-service';
import { addIcons } from 'ionicons';
import { ReportService } from 'src/app/services/report-service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButtons, 
    IonSpinner,
    IonSegment, IonSegmentButton, IonItemSliding, IonItemOption, IonItemOptions,
    IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonBadge, IonChip,
    IonToast, IonListHeader, IonSearchbar, IonFab, IonFabButton,
    IonLabel, IonIcon, IonItem, IonList, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule, IonButton
  ]
})
export class BoardPage implements OnInit, AfterViewInit {

  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('boardInput') boardInput: any;
  @ViewChild('gapInput') gapInput: any;

  flightId!: number;
  flightNumber: string = '';
  searchQuery: string = '';
  gapSearchQuery: string = '';
  
  // Track flight state
  flightStatus: string = ''; 

  allCheckedIn: BoardingSequence[] = [];
  filteredSequences: BoardingSequence[] = [];
  allBoarded: BoardingSequence[] = [];
  missingSequences: number[] = [];
  filteredMissingSequences: number[] = [];

  showToast = false;
  toastMessage = '';
  isLoading = false;
  isDownloading = false;
  showScrollTopButton = false;
  showScrollBottomButton = true;

  viewMode: 'waiting' | 'boarded' | 'gaps' = 'waiting';

  stats = {
    totalCheckedIn: 0,
    totalBoarded: 0,
    totalMissing: 0,
    remaining: 0
  };

  private boardingService = inject(BoardingService);
  private flightService = inject(FlightService);
  private reportService = inject(ReportService);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private route = inject(ActivatedRoute);

  constructor() {
    addIcons({
      'search-outline': searchOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'log-in-outline': logInOutline,
      'arrow-down-outline': arrowDownOutline,
      'arrow-up-outline': arrowUpOutline,
      'person-outline': personOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'arrow-undo-outline': arrowUndoOutline,
      'analytics-outline': analyticsOutline,
      'alert-outline': alertOutline,
      'lock-closed-outline': lockClosedOutline,
      'document-text-outline': documentTextOutline,
      'refresh-outline': refreshOutline,
      'eye-outline': eyeOutline,
      'download-outline': downloadOutline,
      'receipt-outline': receiptOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.flightId = +id;
      this.loadFlightInfo();
      this.loadData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.boardInput) {
        this.boardInput.setFocus();
      }
    }, 500);
  }

  // --- LOAD DATA METHODS ---
  
  loadFlightInfo() {
    this.flightService.getFlightById(this.flightId).subscribe({
      next: (f) => {
        this.flightStatus = f.status;
        this.flightNumber = f.flightNumber;
      },
      error: (err) => {
        console.error('Failed to load flight info', err);
        this.showErrorToast('Failed to load flight information');
      }
    });
  }

  loadData() {
    this.loadCheckedInPassengers();
    this.loadBoardedPassengers();
    this.loadMissingSequences();
  }

  loadCheckedInPassengers() {
    this.isLoading = true;
    this.boardingService.getCheckedInPassengers(this.flightId).subscribe({
      next: (passengers) => {
        this.allCheckedIn = passengers || [];
        this.filteredSequences = [...this.allCheckedIn];
        this.stats.totalCheckedIn = this.allCheckedIn.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load checked-in passengers', err);
        this.isLoading = false;
        this.showErrorToast('Failed to load waiting passengers');
      }
    });
  }

  loadBoardedPassengers() {
    this.boardingService.getBoardedPassengers(this.flightId).subscribe({
      next: (passengers) => {
        this.allBoarded = passengers || [];
        this.stats.totalBoarded = this.allBoarded.length;
      },
      error: (err) => {
        console.error('Failed to load boarded passengers', err);
        this.showErrorToast('Failed to load boarded passengers');
      }
    });
  }

  loadMissingSequences() {
    this.boardingService.getMissingPassengers(this.flightId).subscribe({
      next: (missingSequences) => {
        this.missingSequences = missingSequences || [];
        this.filteredMissingSequences = [...this.missingSequences];
        this.stats.totalMissing = this.missingSequences.length;
      },
      error: (err) => {
        console.error('Failed to load missing sequences', err);
        this.missingSequences = [];
        this.filteredMissingSequences = [];
        this.stats.totalMissing = 0;
      }
    });
  }

  // --- FLIGHT STATUS MANAGEMENT ---

  get minMissing(): number {
    if (this.missingSequences.length === 0) return 0;
    return Math.min(...this.missingSequences);
  }

  get maxMissing(): number {
    if (this.missingSequences.length === 0) return 0;
    return Math.max(...this.missingSequences);
  }

  get isBoardingClosed(): boolean {
    return this.flightStatus === 'BOARDING_CLOSED' || this.flightStatus === 'DEPARTED';
  }

  // --- CLOSE FLIGHT LOGIC ---
  async confirmCloseFlight() {
    const alert = await this.alertController.create({
      header: 'Close Flight?',
      message: `Are you sure? This will mark ${this.missingSequences.length} passengers as MISSING permanently.`,
      buttons: [
        { 
          text: 'Cancel', 
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirm & Close',
          handler: () => this.executeCloseFlight()
        }
      ]
    });
    await alert.present();
  }

  private executeCloseFlight() {
    const loading = this.showLoading('Closing flight...');
    
    this.flightService.closeFlight(this.flightId).subscribe({
      next: async () => {
        // Reload all data after closing
        await this.loadFlightInfo();
        await this.loadData();
        
        await (await loading).dismiss();
        this.showSuccessToast('✓ Flight closed. No-shows finalized.');
      },
      error: async (err) => {
        await (await loading).dismiss();
        this.showErrorToast('Error closing flight: ' + err.message);
      }
    });
  }

  // --- PDF REPORT DOWNLOAD METHODS ---

  async downloadPdf() {
    if (!this.isBoardingClosed) {
      await this.showBoardingNotClosedAlert();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Generating Final Manifest...',
      spinner: 'crescent'
    });
    
    await loading.present();
    this.isDownloading = true;

    try {
      this.reportService.downloadBoardingReport(this.flightId).subscribe({
        next: async (blob: Blob) => {
          const filename = `Final-Manifest-${this.flightNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
          this.reportService.saveAsPdf(blob, filename);
          
          await loading.dismiss();
          this.isDownloading = false;
          this.showSuccessToast('Final manifest downloaded successfully!');
        },
        error: async (error) => {
          await loading.dismiss();
          this.isDownloading = false;
          this.showErrorToast('Failed to download final manifest');
          console.error('Error downloading final manifest:', error);
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.isDownloading = false;
      console.error('Error in download process:', error);
    }
  }

  async downloadBoardingReport() {
    if (!this.isBoardingClosed) {
      await this.showBoardingNotClosedAlert();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Generating Boarding Report...',
      spinner: 'crescent'
    });
    
    await loading.present();
    this.isDownloading = true;

    try {
      this.reportService.downloadBoardingReport(this.flightId).subscribe({
        next: async (blob: Blob) => {
          const filename = `Boarding-Report-${this.flightNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
          this.reportService.saveAsPdf(blob, filename);
          
          await loading.dismiss();
          this.isDownloading = false;
          this.showSuccessToast('Boarding report downloaded successfully!');
        },
        error: async (error) => {
          await loading.dismiss();
          this.isDownloading = false;
          this.showErrorToast('Failed to download boarding report');
          console.error('Error downloading boarding report:', error);
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.isDownloading = false;
      console.error('Error in download process:', error);
    }
  }

  async previewPdf() {
    if (!this.isBoardingClosed) {
      await this.showBoardingNotClosedAlert();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Generating Preview...',
      spinner: 'crescent'
    });
    
    await loading.present();

    try {
      this.reportService.downloadBoardingReport(this.flightId).subscribe({
        next: async (blob: Blob) => {
          this.reportService.previewPdf(blob);
          await loading.dismiss();
        },
        error: async (error) => {
          await loading.dismiss();
          this.showErrorToast('Failed to generate preview');
          console.error('Error previewing PDF:', error);
        }
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Error in preview process:', error);
    }
  }

  // --- HELPER METHODS ---

  private async showLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private async showBoardingNotClosedAlert() {
    const alert = await this.alertController.create({
      header: 'Boarding Not Closed',
      message: 'You can only download reports after boarding has been closed. Please close boarding first.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private showSuccessToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  private showErrorToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  // --- EXISTING METHODS ---

  handleUndo(sequence: BoardingSequence) {
    this.boardingService.undoBoarding(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        this.loadData();
        this.toastMessage = `Sequence #${sequence.sequenceNumber} moved back to waiting.`;
        this.showToast = true;
      },
      error: (err) => {
        this.toastMessage = 'Error undoing boarding';
        this.showToast = true;
      }
    });
  }

  onContentScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollBottomButton = scrollTop < 200;
    this.showScrollTopButton = scrollTop > 300;
  }

  async scrollToTop() {
    await this.content.scrollToTop(500);
    if (this.viewMode === 'waiting' && this.boardInput) {
      setTimeout(() => this.boardInput.setFocus(), 600);
    } else if (this.viewMode === 'gaps' && this.gapInput) {
      setTimeout(() => this.gapInput.setFocus(), 600);
    }
  }

  async scrollToBottom() {
    await this.content.scrollToBottom(500);
    this.showScrollBottomButton = false;
  }

  performBoarding(sequence: BoardingSequence) {
    if (sequence.status !== BoardingStatus.CHECKED_IN) {
      this.toastMessage = `Sequence #${sequence.sequenceNumber} cannot be boarded (status: ${sequence.status})`;
      this.showToast = true;
      return;
    }

    this.boardingService.boardPassenger(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        this.loadData();
        this.toastMessage = `✓ Sequence #${sequence.sequenceNumber} boarded!`;
        this.showToast = true;
        this.searchQuery = '';
      },
      error: (err) => {
        console.error('Boarding failed', err);
        this.toastMessage = `Failed to board sequence #${sequence.sequenceNumber}`;
        this.showToast = true;
      }
    });
  }

  handleSearch(event: any) {
    const query = event.target.value ? event.target.value.toLowerCase() : '';
    this.searchQuery = query;

    if (!query) {
      this.filteredSequences = this.allCheckedIn;
      return;
    }

    this.filteredSequences = this.allCheckedIn.filter(s =>
      s.sequenceNumber.toString().includes(query)
    );
  }

  handleGapSearch(event: any) {
    const query = event.target.value ? event.target.value.toLowerCase() : '';
    this.gapSearchQuery = query;

    if (!query) {
      this.filteredMissingSequences = this.missingSequences;
      return;
    }

    this.filteredMissingSequences = this.missingSequences.filter(seq =>
      seq.toString().includes(query)
    );
  }

  quickBoardBySequence() {
    if (!this.searchQuery.trim()) return;

    const sequenceNum = parseInt(this.searchQuery.trim());
    if (isNaN(sequenceNum)) {
      this.toastMessage = 'Please enter a valid sequence number';
      this.showToast = true;
      return;
    }

    const passenger = this.allCheckedIn.find(
      s => s.sequenceNumber === sequenceNum
    );

    if (!passenger) {
      this.toastMessage = `Sequence #${sequenceNum} not found or already boarded`;
      this.showToast = true;
      return;
    }

    this.performBoarding(passenger);
  }

  clearSearch() {
    if (this.viewMode === 'waiting') {
      this.searchQuery = '';
      this.filteredSequences = this.allCheckedIn;
      if (this.boardInput) {
        this.boardInput.setFocus();
      }
    } else if (this.viewMode === 'gaps') {
      this.gapSearchQuery = '';
      this.filteredMissingSequences = this.missingSequences;
      if (this.gapInput) {
        this.gapInput.setFocus();
      }
    }
  }

  refreshData() {
    this.loadFlightInfo();
    this.loadData();
    this.toastMessage = 'Refreshing data...';
    this.showToast = true;
  }

  onSegmentChange(event: any) {
    this.viewMode = event.detail.value;
    if (this.viewMode === 'waiting') {
      this.searchQuery = '';
      this.filteredSequences = this.allCheckedIn;
    } else if (this.viewMode === 'gaps') {
      this.gapSearchQuery = '';
      this.filteredMissingSequences = this.missingSequences;
    }
  }
}