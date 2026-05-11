import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularProductDetail } from './popular-product-detail';

describe('PopularProductDetail', () => {
  let component: PopularProductDetail;
  let fixture: ComponentFixture<PopularProductDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularProductDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularProductDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
