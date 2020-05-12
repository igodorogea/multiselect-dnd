import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Component({
  selector: 'app-multiselect-search',
  templateUrl: './multiselect-search.component.html',
  styleUrls: ['./multiselect-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectSearchComponent implements AfterViewInit, OnDestroy {
  private readonly subscription = new Subscription();
  @Output() search = new EventEmitter<string>();
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  public ngAfterViewInit() {
    this.subscription.add(
      fromEvent(this.input.nativeElement, 'keyup')
        .pipe(
          debounceTime(300),
          map(() => this.input.nativeElement.value),
          distinctUntilChanged()
        )
        .subscribe(searchTerm => this.search.emit(searchTerm))
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
