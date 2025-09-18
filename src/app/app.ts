import { Component, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass } from '@angular/common';

interface Contact {
  email: string;
  president: string;
}

interface Club {
  id: number;
  name: string;
  category: string;
  description: string;
  longDescription: string;
  logo: string;
  members: number;
  meetings: string;
  activities: string[];
  contact: Contact;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [NgClass]
})
export class AppComponent {
  title = 'University Clubs';
  clubs = signal<Club[]>([]);
  displayedClubs = signal(6);
  selectedCategory = signal('all');
  searchQuery = signal('');
  isLoading = signal(true);
  expandedClubId = signal<number | null>(null);

  categories = [
    { name: 'Tous les Clubs', value: 'all' },
    { name: 'Informatique', value: 'Informatique' },
    { name: 'Social', value: 'Social' },
    { name: 'Mecatronique', value: 'Mecatronique' },
    { name: 'Environnement', value: 'Environnement' },
    { name: 'Sports', value: 'Sports' }
  ];

  // Computed properties
  filteredClubs = computed(() => {
    const clubs = this.clubs();
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase();
    
    let filtered = clubs;
    
    if (category !== 'all') {
      filtered = filtered.filter(club => club.category === category);
    }
    
    if (query) {
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query) ||
        club.longDescription.toLowerCase().includes(query)
      );
    }
    
    return filtered.slice(0, this.displayedClubs());
  });

  totalClubs = computed(() => this.clubs().length);
  showingClubs = computed(() => this.filteredClubs().length);
  hasMoreClubs = computed(() => {
    const clubs = this.clubs();
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase();
    
    let filtered = clubs;
    
    if (category !== 'all') {
      filtered = filtered.filter(club => club.category === category);
    }
    
    if (query) {
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query) ||
        club.longDescription.toLowerCase().includes(query)
      );
    }
    
    return this.displayedClubs() < filtered.length;
  });

  constructor(private http: HttpClient) {
    effect(() => {
      // Any side effects when signals change
    });
    
    this.loadClubs();
  }

  loadClubs() {
    this.http.get<Club[]>('assets/clubs-data.json').subscribe({
      next: (data) => {
        this.clubs.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading clubs:', error);
        this.isLoading.set(false);
      }
    });
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.displayedClubs.set(6);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.displayedClubs.set(6);
  }

  showMore() {
    this.displayedClubs.update(count => count + 3);
  }

  resetFilters() {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
    this.displayedClubs.set(6);
    this.expandedClubId.set(null);
  }

  toggleDetails(clubId: number) {
    if (this.expandedClubId() === clubId) {
      this.expandedClubId.set(null);
    } else {
      this.expandedClubId.set(clubId);
    }
  }

  isExpanded(clubId: number): boolean {
    return this.expandedClubId() === clubId;
  }

  getCategoryClass(category: string): string {
    switch(category) {
      case 'Informatique': return 'bg-blue-100 text-blue-800';
      case 'Social': return 'bg-purple-100 text-purple-800';
      case 'Mecatronique': return 'bg-green-100 text-green-800';
      case 'Environnement': return 'bg-teal-100 text-teal-800';
      case 'Sports': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}