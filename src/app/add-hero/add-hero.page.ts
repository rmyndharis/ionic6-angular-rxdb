import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DatabaseService } from './../_services/database.service';

@Component({
  selector: 'app-add-hero',
  templateUrl: './add-hero.page.html',
  styleUrls: ['./add-hero.page.scss'],
})
export class AddHeroPage implements OnInit {
  heroesForm: FormGroup;
  tempDoc: any;

  constructor(
    private formBld: FormBuilder,
    private dbService: DatabaseService,
    private router: Router,
    private zone: NgZone
  ) {
    this.reset();
  }

  ngOnInit() {
    this.heroesForm = this.formBld.group({
      name: ['', Validators.compose([Validators.required])],
      color: ['', Validators.compose([Validators.required])],
    });
  }

  reset() {
    this.tempDoc = this.dbService.db.hero.newDocument({
      maxHP: this.getRandomArbitrary(100, 1000),
    });
  }

  async addHero() {
    this.tempDoc.name = this.heroesForm.get('name').value;
    this.tempDoc.hp = this.getRandomArbitrary(0, 100);
    this.tempDoc.color = this.heroesForm.get('color').value;
    try {
      await this.tempDoc.save();
      this.zone.run(() => {});
      this.reset();
      this.router.navigateByUrl('/');
    } catch (err) {
      console.error('error:', err);
      throw err;
    }
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   *
   * @link https://stackoverflow.com/a/1527820/3443137
   */
  private getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
