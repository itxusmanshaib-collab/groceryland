import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCategoryProducts } from './top-category-products';

describe('TopCategoryProducts', () => {
  let component: TopCategoryProducts;
  let fixture: ComponentFixture<TopCategoryProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopCategoryProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopCategoryProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
