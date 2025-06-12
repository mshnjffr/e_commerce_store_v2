import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-exercises',
  imports: [],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css'
})
export class ExercisesComponent implements OnInit {
  // Track completed exercises in localStorage
  completedExercises: Set<string> = new Set();

  ngOnInit() {
    this.loadCompletedExercises();
    this.setupCheckboxListeners();
  }

  private loadCompletedExercises() {
    const saved = localStorage.getItem('completedCodyExercises');
    if (saved) {
      this.completedExercises = new Set(JSON.parse(saved));
    }
  }

  private saveCompletedExercises() {
    localStorage.setItem('completedCodyExercises', JSON.stringify([...this.completedExercises]));
  }

  private setupCheckboxListeners() {
    // Setup event listeners after view init
    setTimeout(() => {
      // Restore checkbox states
      this.completedExercises.forEach(id => {
        const checkbox = document.getElementById(id) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
        }
      });

      // Add event listeners for checkbox changes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
          const target = event.target as HTMLInputElement;
          if (target.checked) {
            this.completedExercises.add(target.id);
          } else {
            this.completedExercises.delete(target.id);
          }
          this.saveCompletedExercises();
        });
      });
    }, 100);
  }
}
