import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightDetailPage } from './flight-detail.page';

describe('FlightDetailPage', () => {
  let component: FlightDetailPage;
  let fixture: ComponentFixture<FlightDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
