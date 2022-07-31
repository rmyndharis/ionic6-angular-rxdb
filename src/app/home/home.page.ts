/* eslint-disable @angular-eslint/no-output-rename */
import { ChangeDetectionStrategy, Component, EventEmitter, NgZone, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { RxHeroDocument } from '../_databases/rx-heroes.db';
import { DatabaseService } from './../_services/database.service';

import type { Observable } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [DatabaseService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  @Output('edit') editChange: EventEmitter<RxHeroDocument> = new EventEmitter();
  public emittedFirst = false;
  public heroes$: Observable<RxHeroDocument[]>;

  constructor(
    private router: Router,
    private dbService: DatabaseService,
    private zone: NgZone
  ) {
    this.loadDB();
  }

  set edit(hero: RxHeroDocument) {
    console.log('editHero: ' + hero.name);
    this.editChange.emit(hero);
  }

  editHero(hero: RxHeroDocument) {
    const navigationExtras: NavigationExtras = {
      state: { name: hero.name },
    };
    this.router.navigate(['edit-hero'], navigationExtras);
  }

  loadDB() {
    this.heroes$ = this.dbService.db.hero
      .find({
        selector: {},
        sort: [{ name: 'asc' }],
      })
      .$.pipe(
        tap(() => {
          /**
           * Ensure that this observable runs inside of angulars zone
           * otherwise there is a bug that needs to be fixed inside of RxDB
           * You do not need this check in your own app.
           */
          this.zone.run(() => {});
          this.emittedFirst = true;
        })
      );
  }

  addHero() {
    this.router.navigateByUrl('add-hero', { replaceUrl: false });
  }

  deleteHero(hero: RxHeroDocument) {
    hero.remove();
  }

  displayHP(num: number) {
    return Number(num).toFixed(2);
  }

  // async foo(): Promise<string> {
  //   const db = this.dbService.db;
  //   const firstDoc = await db.hero.findOne().exec();
  //   if (!firstDoc) {
  //     return 'not found';
  //   }
  //   const f: string = firstDoc.color;
  //   return f;
  // }
}
