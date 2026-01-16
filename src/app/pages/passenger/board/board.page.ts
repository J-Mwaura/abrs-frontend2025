import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem,
  IonIcon, IonLabel, IonButton, 
  IonSearchbar, IonListHeader, IonToast, IonFab, IonFabButton,
  IonCard, IonCardContent, 
  IonSegment, IonItemOptions, IonItemOption, IonItemSliding, IonSegmentButton, IonCardHeader, IonCardTitle, IonChip } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import {
  searchOutline, checkmarkCircleOutline, logInOutline,
  arrowUpOutline, arrowDownOutline,
  personOutline, checkmarkDoneOutline,
  arrowUndoOutline,
  refreshOutline
} from 'ionicons/icons';
import { BoardingSequence, BoardingStatus } from 'src/app/models/boarding-sequence';
import { BoardingService } from 'src/app/services/boarding-service';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
  standalone: true,
  imports: [
    IonSegment, IonSegmentButton, IonItemSliding, IonItemOption, IonItemOptions,
    IonCardContent, IonCard,
    IonToast, IonListHeader, IonSearchbar, IonFab, IonFabButton,
    IonLabel, IonIcon, IonItem, IonList, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule, IonButton,
    IonChip,
    IonCardHeader,
    IonCardTitle
]
})
export class BoardPage implements OnInit, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('boardInput') boardInput: any;

  flightId!: number;
  flightNumber: string = '';
  searchQuery: string = '';

  // Lists for different statuses
  allCheckedIn: BoardingSequence[] = [];      // CHECKED_IN status
  filteredSequences: BoardingSequence[] = [];
  
  // UI state
  showToast = false;
  toastMessage = '';
  isLoading = false;
  showScrollTopButton = false;
  showScrollBottomButton = true;

  allBoarded: BoardingSequence[] = [];
  viewMode: 'waiting' | 'boarded' = 'waiting';

  // Stats
  stats = {
    totalCheckedIn: 0,
    totalBoarded: 0,
    remaining: 0
  };

  private boardingService = inject(BoardingService);
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
      'refresh-outline': refreshOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.flightId = +id;
      this.loadData();
    }
  }

  // Add these getter properties to your component class

// Get the smallest missing sequence
get minMissing(): number {
  if (this.missingSequences.length === 0) return 0;
  return Math.min(...this.missingSequences);
}

// Get the largest missing sequence
get maxMissing(): number {
  if (this.missingSequences.length === 0) return 0;
  return Math.max(...this.missingSequences);
}

// Get a sorted array of missing sequences
get sortedMissing(): number[] {
  return [...this.missingSequences].sort((a, b) => a - b);
}

  loadData() {
    this.loadCheckedInPassengers();
    this.loadBoardedPassengers();
  }

  loadBoardedPassengers() {
    this.boardingService.getBoardedPassengers(this.flightId).subscribe(data => {
      this.allBoarded = data || [];
      this.updateStats();
    });
  }

  handleUndo(sequence: BoardingSequence) {
    this.boardingService.undoBoarding(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        this.loadData();
        this.toastMessage = `Seq #${sequence.sequenceNumber} moved back to waiting.`;
        this.showToast = true;
      },
      error: (err) => {
        this.toastMessage = 'Error undoing boarding';
        this.showToast = true;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.boardInput) {
        this.boardInput.setFocus();
      }
    }, 500);
  }

  onContentScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showScrollBottomButton = scrollTop < 200;
    this.showScrollTopButton = scrollTop > 300;
  }

  async scrollToTop() {
    await this.content.scrollToTop(500);
    if (this.boardInput) {
      setTimeout(() => this.boardInput.setFocus(), 600);
    }
  }

  async scrollToBottom() {
    await this.content.scrollToBottom(500);
    this.showScrollBottomButton = false;
  }

  loadCheckedInPassengers() {
    this.isLoading = true;
    this.boardingService.getCheckedInPassengers(this.flightId).subscribe({
      next: (passengers) => {
        this.allCheckedIn = passengers || [];
        this.filteredSequences = [...this.allCheckedIn];
        
        // Get stats and flight number
        this.boardingService.getBoardingStats(this.flightId).subscribe({
          next: (serverStats) => {
            this.flightNumber = serverStats.flightNumber || `Flight ${this.flightId}`;
            this.stats.totalBoarded = serverStats.boarded || 0;
            this.stats.totalCheckedIn = serverStats.checkedIn || 0;
            this.stats.remaining = this.stats.totalCheckedIn;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load stats', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load checked-in passengers', err);
        this.isLoading = false;
      }
    });
  }

  performBoarding(sequence: BoardingSequence) {
    if (sequence.status !== BoardingStatus.CHECKED_IN) {
      this.toastMessage = `Sequence #${sequence.sequenceNumber} cannot be boarded (status: ${sequence.status})`;
      this.showToast = true;
      return;
    }

    this.boardingService.boardPassenger(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        // Refresh both lists
        this.loadData();
        this.toastMessage = `✓ Sequence #${sequence.sequenceNumber} boarded!`;
        this.showToast = true;
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

  private updateStats() {
    this.stats.totalCheckedIn = this.allCheckedIn.length;
    this.stats.totalBoarded = this.allBoarded.length;
    this.stats.remaining = this.stats.totalCheckedIn;
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

  // Add this getter to your class
get missingSequences(): number[] {
  if (this.allCheckedIn.length === 0 && this.allBoarded.length === 0) return [];

  // 1. Get all numbers that SHOULD be boarded (both lists)
  const allExpectedNumbers = [
    ...this.allCheckedIn.map(p => p.sequenceNumber),
    ...this.allBoarded.map(p => p.sequenceNumber)
  ];

  if (allExpectedNumbers.length === 0) return [];

  // 2. Find the range (from 1 to the highest checked-in number)
  const maxSequence = Math.max(...allExpectedNumbers);
  const boardedSet = new Set(this.allBoarded.map(p => p.sequenceNumber));
  
  const gaps: number[] = [];

  // 3. Find which numbers in that range aren't in the boarded set
  for (let i = 1; i <= maxSequence; i++) {
    if (!boardedSet.has(i)) {
      gaps.push(i);
    }
  }
  return gaps;
}

  clearSearch() {
    this.searchQuery = '';
    this.filteredSequences = this.allCheckedIn;
    if (this.boardInput) {
      this.boardInput.setFocus();
    }
  }

  refreshData() {
    this.loadData();
    this.toastMessage = 'Refreshing data...';
    this.showToast = true;
  }

  getStatusColor(status: BoardingStatus): string {
    switch (status) {
      case BoardingStatus.BOARDED: return 'success';
      case BoardingStatus.CHECKED_IN: return 'warning';
      case BoardingStatus.EXPECTED: return 'medium';
      default: return 'medium';
    }
  }
}