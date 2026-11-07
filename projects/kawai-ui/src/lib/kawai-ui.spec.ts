import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KawaiUi } from './kawai-ui';

describe('KawaiUi', () => {
  let component: KawaiUi;
  let fixture: ComponentFixture<KawaiUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KawaiUi],
    }).compileComponents();

    fixture = TestBed.createComponent(KawaiUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
