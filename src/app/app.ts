import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent { // Root application component
  title = 'anchorzup-dashboard';
}