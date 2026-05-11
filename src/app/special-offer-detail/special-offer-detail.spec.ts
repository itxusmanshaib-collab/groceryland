import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialOfferDetail } from './special-offer-detail';

describe('SpecialOfferDetail', () => {
  let component: SpecialOfferDetail;
  let fixture: ComponentFixture<SpecialOfferDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialOfferDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialOfferDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
