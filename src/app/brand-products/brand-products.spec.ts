import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandProducts } from './brand-products';

describe('BrandProducts', () => {
  let component: BrandProducts;
  let fixture: ComponentFixture<BrandProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
