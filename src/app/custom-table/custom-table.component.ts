import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  mergeMap,
  noop,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.css'],
})
export class CustomTableComponent implements OnInit, OnDestroy {
  _dataStream = new BehaviorSubject<null>(null);
  _dataStream$ = this._dataStream.pipe(
    mergeMap(() => {
      return this.dataStream.pipe(finalize(() => console.log('FIN 2')));
    }),
    map((items) => this.filterItems(items)),
    finalize(() => console.log('FIN 3'))
  );
  @Input() displayedColumns: string[] = [];
  @Input() dataStream: Observable<any> = of([]);

  searchControl = new FormControl<null | string>(null);
  searchControlSubscription!: Subscription;

  searchTerm: string | null = null;

  ngOnInit(): void {
    this.searchControlSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((searchTerm) => {
          this.searchTerm = searchTerm;
          this._dataStream.next(null);
        })
      )
      .subscribe(noop);
  }

  ngOnDestroy(): void {
    this.searchControlSubscription.unsubscribe();
  }

  filterItems(items: any[]) {
    return items.filter((item) => {
      if (!this.searchTerm) return true;
      else {
        return this.displayedColumns.some((c) => {
          return item[c]
            .toString()
            .trim()
            .toLowerCase()
            .includes(this.searchTerm!.trim().toLowerCase());
        });
      }
    });
  }
}
