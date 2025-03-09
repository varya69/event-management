import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'event-management';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Theme service is initialized in its constructor
  }
}
