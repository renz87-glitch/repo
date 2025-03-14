import { Component, OnInit } from '@angular/core';
import { ApirepoService } from 'src/app/services/apirepo.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  message: string = '';

  constructor(private apiService: ApirepoService) {}

  ngOnInit(): void {
    this.apiService.getHelloMessage().subscribe(response => {
      this.message = response.message;
    });
  }

}
