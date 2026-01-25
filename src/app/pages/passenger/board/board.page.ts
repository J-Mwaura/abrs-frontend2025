import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonButton, IonBadge, IonSpinner, IonSearchbar, IonListHeader, IonToast, IonFab, IonFabButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSegment, IonItemOptions, IonItemOption, IonItemSliding, IonSegmentButton, IonChip, AlertController, LoadingController, IonButtons, IonBackButton, IonMenuButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialogService';
import { ToastrService } from 'src/app/services/toast-service';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
  standalone: true,
  imports: [IonButtons,
    IonSpinner,
    IonSegment, IonSegmentButton, IonItemSliding, IonItemOption, IonItemOptions,
    IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonBadge, IonChip,
    IonListHeader, IonSearchbar, IonFab, IonFabButton,
    IonLabel, IonIcon, IonItem, IonList, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonMenuButton]
})
export class BoardPage implements OnInit, AfterViewInit {

  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('boardInput') boardInput: any;
  // Remove this line since it's not in template
  // @ViewChild('gapInput') gapInput: any;

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
  private confirmationDialog = inject(ConfirmationDialogService);
  private toastrService = inject(ToastrService);
  private route = inject(ActivatedRoute);

  constructor() {
    addIcons({
      'alert-circle-outline': alertOutline,
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
        this.toastrService.error('Failed to load flight information');
      }
    });
  }

  // Load all necessary data including flight status
  loadData() {
    // Load flight status first to determine if closed
    this.flightService.getFlightStatus(this.flightId).subscribe({
      next: (status) => {
        this.flightStatus = status;
        // Then load all other data
        this.loadAllBoardingData();
      },
      error: (err) => {
        this.toastrService.error(this.getErrorMessage(err));
        // Still try to load other data even if status fails
        this.loadAllBoardingData();
      }
    });
  }

  private loadAllBoardingData() {
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
        this.toastrService.error('Failed to load waiting passengers');
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
        this.toastrService.error('Failed to load boarded passengers');
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

  isExactMatch(): boolean {
    const query = this.searchQuery?.trim();
    return !!query && 
           this.filteredSequences.length > 0 && 
           this.filteredSequences[0].sequenceNumber.toString() === query;
  }

  // --- UNDO BOARDING IMPROVED METHOD ---
  async handleUndo(sequence: BoardingSequence) {
    // Prevent action if flight is already closed (preventative UX)
    if (this.isBoardingClosed) {
      this.toastrService.error('Cannot undo boarding. The flight is already closed.');
      return;
    }

    // Show confirmation dialog
    const confirmed = await this.confirmationDialog.show(
      'Confirm Undo',
      `Are you sure you want to undo boarding for sequence #${sequence.sequenceNumber}?`,
      'Cancel',
      'Confirm'
    );
    
    if (!confirmed) {
      return;
    }
    
    // Perform undo boarding
    this.boardingService.undoBoarding(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        this.loadData(); // Reload data to reflect changes
        this.toastrService.success(`Sequence #${sequence.sequenceNumber} moved back to waiting.`);
      },
      error: (err: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(err);
        this.toastrService.error(errorMessage);
      }
    });
  }

  // Extract error message from HttpErrorResponse
  private getErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 409) {
      return err.error?.message || 'Cannot undo boarding. The flight is already closed.';
    }
    if (err.status === 400) {
      return err.error?.message || 'Invalid request. Please check the data.';
    }
    if (err.status === 404) {
      return 'Sequence or flight not found.';
    }
    if (err.status === 0) {
      return 'Network error. Please check your internet connection.';
    }
    if (err.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return err.error?.message || 'An unexpected error occurred.';
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

  private async executeCloseFlight() {
    const loading = await this.showLoading('Closing flight...');
    
    this.flightService.closeFlight(this.flightId).subscribe({
      next: async () => {
        // Reload all data after closing
        await this.loadFlightInfo();
        await this.loadData();
        
        await loading.dismiss();
        this.toastrService.success('✓ Flight closed. No-shows finalized.');
      },
      error: async (err) => {
        await loading.dismiss();
        this.toastrService.error('Error closing flight: ' + err.message);
      }
    });
  }

  // --- PDF REPORT DOWNLOAD METHODS ---
  async downloadReport(type: 'Final-Manifest' | 'Boarding-Report') {
  if (!this.isBoardingClosed) {
    await this.showBoardingNotClosedAlert();
    return;
  }

  const label = type.replace('-', ' '); // Turns 'Final-Manifest' into 'Final Manifest'
  const loading = await this.loadingController.create({
    message: `Generating ${label}...`,
    spinner: 'crescent'
  });
  
  await loading.present();
  this.isDownloading = true;

  this.reportService.downloadBoardingReport(this.flightId).subscribe({
    next: async (blob: Blob) => {
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `${type}-${this.flightNumber}-${dateStr}.pdf`;
      
      this.reportService.saveAsPdf(blob, filename);
      
      await loading.dismiss();
      this.isDownloading = false;
      this.toastrService.success(`${label} downloaded successfully!`);
    },
    error: async (error) => {
      await loading.dismiss();
      this.isDownloading = false;
      this.toastrService.error(`Failed to download ${label.toLowerCase()}`);
    }
  });
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
          this.toastrService.error('Failed to generate preview');
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

  // --- EXISTING METHODS (UPDATED WITH TOASTR SERVICE) ---

  onContentScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollBottomButton = scrollTop < 200;
    this.showScrollTopButton = scrollTop > 300;
  }

  async scrollToTop() {
    await this.content.scrollToTop(500);
    if (this.viewMode === 'waiting' && this.boardInput) {
      setTimeout(() => this.boardInput.setFocus(), 600);
    }
    // Removed gapInput reference since it doesn't exist
  }

  async scrollToBottom() {
    await this.content.scrollToBottom(500);
    this.showScrollBottomButton = false;
  }

  performBoarding(sequence: BoardingSequence) {
    if (sequence.status !== BoardingStatus.CHECKED_IN) {
      this.toastrService.error(`Sequence #${sequence.sequenceNumber} cannot be boarded (status: ${sequence.status})`);
      return;
    }

    if (this.isBoardingClosed) {
      this.toastrService.error('Cannot board passenger. The flight is already closed.');
      return;
    }

    this.boardingService.boardPassenger(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        this.loadData();
        this.toastrService.success(`✓ Sequence #${sequence.sequenceNumber} boarded!`);
        this.searchQuery = '';
      },
      error: (err) => {
        console.error('Boarding failed', err);
        this.toastrService.error(`Failed to board sequence #${sequence.sequenceNumber}`);
      }
    });
  }

  handleSearch(event: any) {
    const query = event.target.value ? event.target.value.toLowerCase().trim() : '';
    this.searchQuery = query;

    if (!query) {
      this.filteredSequences = [...this.allCheckedIn];
      return;
    }

    // Improved priority sorting: Exact matches first, then starts-with, then includes.
    this.filteredSequences = this.allCheckedIn
      .filter(s => s.sequenceNumber.toString().includes(query))
      .sort((a, b) => {
        const aStr = a.sequenceNumber.toString();
        const bStr = b.sequenceNumber.toString();
        if (aStr === query) return -1;
        if (bStr === query) return 1;
        if (aStr.startsWith(query) && !bStr.startsWith(query)) return -1;
        if (bStr.startsWith(query) && !aStr.startsWith(query)) return 1;
        return 0;
      });
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
    const query = this.searchQuery.trim();
    if (!query) return;

    if (this.isBoardingClosed) {
      this.toastrService.error('Cannot board passenger. The flight is already closed.');
      return;
    }

    // Since our search now sorts exact matches to index 0, check the first item.
    const passenger = this.filteredSequences[0];

    if (!passenger || passenger.sequenceNumber.toString() !== query) {
      this.toastrService.error(`Sequence #${query} not found in waiting list`);
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
    }
  }

  refreshData() {
    this.loadFlightInfo();
    this.loadData();
    this.toastrService.info('Refreshing data...');
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

  // Inside your FlightsPage or BoardingBoardPage class

async presentNoteAlert(sequenceNumber: number) {
  const alert = await this.alertController.create({
    header: 'Add Boarding Note',
    subHeader: `Sequence #${sequenceNumber}`,
    message: 'Adding a note will be recorded in the audit trail.',
    inputs: [
      {
        name: 'note',
        type: 'textarea',
        placeholder: 'e.g., Offloaded due to no-show at gate...',
      }
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Save Note',
        handler: (data) => {
          if (data.note && data.note.trim().length > 0) {
            this.executeAddNote(sequenceNumber, data.note);
          }
        }
      }
    ]
  });

  await alert.present();
}

private executeAddNote(sequenceNumber: number, note: string) {
  // Use the flightId available in your component (e.g., from the route)
  this.boardingService.addPassengerNote(this.flightId, sequenceNumber, note).subscribe({
    next: () => {
      // Refresh data to show updated stats/events if necessary
      this.refreshData(); 
      this.toastrService.success(`Note saved for Sequence #${sequenceNumber}`);  
    },
    error: (err) => {
      this.toastrService.error(err.message || 'Failed to save note');
    }
  });
}
}