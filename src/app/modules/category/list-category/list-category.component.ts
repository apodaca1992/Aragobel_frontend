import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Category, DatabaseService } from '@services/database.service';

@Component({
  selector: 'app-list-category',
  templateUrl: './list-category.component.html',
  styleUrls: ['./list-category.component.scss'],
})
export class ListCategoryComponent  implements OnInit {
  categories = this.databaseService.getCategories();
  newCategoryName = '';

  constructor(private databaseService: DatabaseService) { 
    effect(() => {
      console.log('CATEGORIES CHANGED ', this.categories());
    })
  }

  async createCategory(){
    await this.databaseService.addCategory(this.newCategoryName);
    this.newCategoryName = '';
  }

  updateCategory(category: Category){
    const active = category.active ? 1 : 0;
    this.databaseService.updateCategoryById(category.id.toString(), active);
  }

  deleteCategory(category: Category){
    this.databaseService.deleteCategoryById(category.id.toString());
  }

  ngOnInit() {}

}
