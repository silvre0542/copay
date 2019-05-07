import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {
  private API_URL: string =
    'https://dailynews.bitcoindiamond.org/wp-json/wp/v2/';
  public Categories: any = [];
  constructor(public http: HttpClient) {}

  get(query: string = '') {
    return this.http.get(this.API_URL + query);
  }

  getCategories() {
    this.get('categories?_embet&per_page=100').subscribe(data => {
      this.Categories = data;
    });
  }
  getCatName(cat_id: number) {
    let cat_name: string = '';

    this.Categories.forEach(elements => {
      if (elements.id == cat_id) {
        cat_name = elements.name;
      }
    });

    return cat_name;
  }
}
