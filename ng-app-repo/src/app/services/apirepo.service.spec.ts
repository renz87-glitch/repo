import { TestBed } from '@angular/core/testing';

import { ApirepoService } from './apirepo.service';

describe('ApirepoService', () => {
  let service: ApirepoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApirepoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
