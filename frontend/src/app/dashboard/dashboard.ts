import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { ApplicationsService } from '../applications.service';
import { DashboardStats, ApplicationStatus } from '../models';
import { APPLICATION_STATUSES } from '../models';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  // Doughnut chart for status breakdown
  statusChartData = signal<ChartConfiguration<'doughnut'>['data']>({
    labels: [],
    datasets: [{ data: [] }]
  });

  statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  // Bar chart for applications by month
  monthlyChartData = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [{
      label: 'Applications',
      data: []
    }]
  });

  monthlyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  constructor(private applicationsService: ApplicationsService) {}

  ngOnInit() {
    this.applicationsService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.buildCharts(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load dashboard stats.');
        this.isLoading.set(false);
      }
    });
  }

  buildCharts(data: DashboardStats) {
    // Status doughnut chart
    const statusColors: Record<string, string> = {
      Applied: '#1565c0',
      PhoneScreen: '#6a1b9a',
      Interview: '#e65100',
      TechnicalAssessment: '#283593',
      Offer: '#2e7d32',
      Rejected: '#c62828',
      Withdrawn: '#616161'
    };

    const statusLabels = Object.keys(data.byStatus);
    const statusValues = Object.values(data.byStatus);

    this.statusChartData.set({
      labels: statusLabels,
      datasets: [{
        data: statusValues,
        backgroundColor: statusLabels.map(s => statusColors[s] ?? '#888'),
        borderWidth: 0
      }]
    });

    // Monthly bar chart
    this.monthlyChartData.set({
      labels: Object.keys(data.byMonth),
      datasets: [{
        label: 'Applications',
        data: Object.values(data.byMonth),
        backgroundColor: '#1565c0',
        borderRadius: 4
      }]
    });
  }

  get responseRate(): number {
    const total = this.stats()?.totalApplications ?? 0;
    if (total === 0) return 0;
    const active = this.stats()?.activeApplications ?? 0;
    return Math.round((active / total) * 100);
  }
}