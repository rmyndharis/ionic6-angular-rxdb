import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { addRxPlugin } from 'rxdb';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { RxHeroDocument } from './../_databases/rx-heroes.db.d';
import { DatabaseService } from './../_services/database.service';

/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @angular-eslint/no-output-rename */
addRxPlugin(RxDBUpdatePlugin);
@Component({
  selector: 'app-edit-hero',
  templateUrl: './edit-hero.page.html',
  styleUrls: ['./edit-hero.page.scss'],
})
export class EditHeroPage implements OnInit, OnDestroy {
  @Input('hero') heroDoc?: RxHeroDocument;
  @Output('done') done = new EventEmitter();

  heroName: any;
  // heroDoc: any;
  heroForm: FormGroup;
  public synced = true;
  private subs: Subscription[] = [];

  constructor(
    private formBld: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dbService: DatabaseService,
    private changeDR: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.synced = true;
    this.activatedRoute.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.heroName = this.router.getCurrentNavigation().extras.state.name;
        this.loadHeroData(this.heroName);
      }
    });
  }

  async loadHeroData(heroName: string) {
    const { db } = this.dbService;
    this.heroDoc = await db.hero
      .findOne({
        selector: {
          name: heroName,
        },
      })
      .exec();
    if (!this.heroDoc) {
      return 'not found';
    }
    const heroColor: string = this.heroDoc.color;
    const heroHP: number = this.heroDoc.hp;
    const heroMaxHP: number = this.heroDoc.maxHP;
    // console.log(heroColor);
    this.heroForm.patchValue({
      name: heroName,
      color: heroColor,
      hp: heroHP,
      maxHP: heroMaxHP,
    });

    this.subs.push(
      this.heroDoc.$.pipe(skip(1)).subscribe(() => {
        this.synced = false;
        this.changeDR.detectChanges();
      })
    );
  }

  ngOnInit() {
    this.heroForm = this.formBld.group({
      name: [
        { value: '', disabled: true },
        Validators.compose([Validators.required]),
      ],
      color: ['', Validators.compose([Validators.required])],
      hp: ['', Validators.compose([Validators.min(0), Validators.max(100)])],
      maxHP: [
        '',
        Validators.compose([Validators.min(0), Validators.max(1000)]),
      ],
    });
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  async editHero() {
    await this.heroDoc.update({
      $set: {
        color: this.heroForm.get('color').value,
        hp: this.heroForm.get('hp').value,
        maxHP: this.heroForm.get('maxHP').value,
      },
    });
    this.zone.run(() => {});
    this.done.emit(true);
    this.router.navigateByUrl('/');
  }

  resync() {
    const heroColor: string = this.heroDoc.color;
    const heroHP: number = this.heroDoc.hp;
    const heroMaxHP: number = this.heroDoc.maxHP;
    this.heroForm.patchValue({
      name: this.heroName,
      color: heroColor,
      hp: heroHP,
      maxHP: heroMaxHP,
    });
    this.synced = true;
    this.changeDR.detectChanges();
  }

  async cancel() {
    this.done.emit(false);
  }
}
