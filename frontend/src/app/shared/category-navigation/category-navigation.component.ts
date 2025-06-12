import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-navigation',
  imports: [CommonModule, RouterLink],
  templateUrl: './category-navigation.component.html',
  styleUrl: './category-navigation.component.css'
})
export class CategoryNavigationComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: string = '';
  @Input() showProductCount: boolean = true;
  @Input() hierarchical: boolean = false;
  @Output() categorySelect = new EventEmitter<Category>();

  organizedCategories: Category[] = [];
  isExpanded: boolean = false;

  ngOnInit() {
    if (this.hierarchical) {
      this.organizeCategories();
    } else {
      this.organizedCategories = this.categories;
    }
  }

  ngOnChanges() {
    if (this.hierarchical) {
      this.organizeCategories();
    } else {
      this.organizedCategories = this.categories;
    }
  }

  private organizeCategories() {
    // Organize categories into parent-child hierarchy
    const rootCategories = this.categories.filter(cat => !cat.parentCategory);
    
    this.organizedCategories = rootCategories.map(parent => ({
      ...parent,
      children: this.categories.filter(cat => cat.parentCategory === parent._id)
    }));
  }

  onCategoryClick(category: Category) {
    this.categorySelect.emit(category);
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  getChildCategories(parentId: string): Category[] {
    return this.categories.filter(cat => cat.parentCategory === parentId);
  }

  isSelected(categoryId: string): boolean {
    return this.selectedCategoryId === categoryId;
  }

  hasChildren(categoryId: string): boolean {
    return this.categories.some(cat => cat.parentCategory === categoryId);
  }
}
