import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonNote, IonBadge, IonButton, IonItemGroup, IonSearchbar, IonListHeader, IonText, IonToast, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { searchOutline, checkmarkCircleOutline, logInOutline, arrowUpOutline, arrowDownOutline } from 'ionicons/icons'; // 2. Import icons
import { BoardingSequence, BoardingStatus } from 'src/app/models/boarding-sequence';
import { BoardingService } from 'src/app/services/boarding-service';
import { addIcons } from 'ionicons';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.page.html',
  styleUrls: ['./check-in.page.scss'],
  standalone: true,
  imports: [IonFabButton, IonFab, IonToast, IonText, IonListHeader, IonSearchbar, IonButton, IonBadge, IonLabel, IonIcon, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]

})
export class CheckInPage implements OnInit  {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('seqInput') seqInput: any;
  
  showScrollButton = true;
  showScrollTopButton = false;

  flightId!: number;
  searchQuery: string = '';
  allExpected: BoardingSequence[] = [];
  filteredSequences: BoardingSequence[] = [];
  recentCheckIns: BoardingSequence[] = [];

  showToast = false;
  toastMessage = '';

  private boardingService = inject(BoardingService);
  private route = inject(ActivatedRoute);

  constructor() {
    // 3. Register the icons here
    addIcons({ 'search-outline': searchOutline,
    'checkmark-circle-outline': checkmarkCircleOutline,
    'log-in-outline': logInOutline,
    'arrow-down-outline': arrowDownOutline, // Match the HTML exactly
    'arrow-up-outline': arrowUpOutline
     });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.flightId = +id;
      this.loadExpectedData();
    }
  }


  onContentScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    // Hide button if we are close to the bottom (e.g., within 100px)
    // We can also hide it if we are at the very top
    this.showScrollButton = scrollTop < 200; 
    // Show "Down" arrow if we are near the top (to go to recent)
  this.showScrollButton = scrollTop < 150; 
  
  // Show "Up" arrow if we have scrolled down significantly
  this.showScrollTopButton = scrollTop > 300;
  }

  async scrollToTop() {
    await this.content.scrollToTop(500); // 500ms smooth scroll
    
    // Optional: Auto-focus the search bar when they get back to the top
    if (this.seqInput) {
      setTimeout(() => this.seqInput.setFocus(), 600);
    }
  }

  async scrollToBottom() {
    await this.content.scrollToBottom(500);
    this.showScrollButton = false;
  }

  loadExpectedData() {
    this.boardingService.getExpectedPassengers(this.flightId).subscribe({
      next: (passengers) => {
        // Since your service uses unwrap(), 'passengers' IS the array
        console.log('Data received:', passengers);
        this.allExpected = passengers || [];
        this.filteredSequences = [...this.allExpected];
      },
      error: (err) => console.error('Loading failed', err)
    });
  }

  handleSearch(event: any) {
    const query = event.target.value ? event.target.value.toLowerCase() : '';
    this.searchQuery = query;

    if (!query) {
      this.filteredSequences = this.allExpected;
      return;
    }

    this.filteredSequences = this.allExpected.filter(s =>
      s.sequenceNumber.toString().includes(query)
    );
  }

  performCheckIn(sequence: BoardingSequence) {
    this.boardingService.checkInPassenger(this.flightId, sequence.sequenceNumber).subscribe({
      next: () => {
        // 1. "Optimistic" UI Update: Remove from the current list immediately
        this.allExpected = this.allExpected.filter(s => s.sequenceNumber !== sequence.sequenceNumber);
        this.filteredSequences = this.filteredSequences.filter(s => s.sequenceNumber !== sequence.sequenceNumber);

        // 2. Add to the 'Recent' list. 
        // FIX: Use BoardingStatus.CHECKED_IN instead of the string 'CHECKED_IN'
        const confirmedPassenger: BoardingSequence = {
          ...sequence,
          status: BoardingStatus.CHECKED_IN
        };

        this.recentCheckIns.unshift(confirmedPassenger);

        // 3. Keep the 'Recent' list manageable
        if (this.recentCheckIns.length > 5) {
          this.recentCheckIns.pop();
        }

        // 4. Reset for the next passenger
        this.searchQuery = '';
        this.toastMessage = `Sequence #${sequence.sequenceNumber} Checked In`;
        this.showToast = true;

        // 5. Automatic Focus back to search for high-speed entry
        if (this.seqInput) {
          setTimeout(() => this.seqInput.setFocus(), 100);
        }
      },
      error: (err) => {
        this.toastMessage = err.message;
        this.showToast = true;
      }
    });
  }
}