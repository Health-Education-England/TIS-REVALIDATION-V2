import { Component } from "@angular/core";
import { PageEvent } from "@angular/material/paginator/paginator";
import { Select, Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import {
  GetTrainees,
  PaginateTrainees,
  UpdateTraineesRoute
} from "../state/trainees.actions";
import { TraineesState } from "../state/trainees.state";

@Component({
  selector: "app-trainee-list-paginator",
  templateUrl: "./trainee-list-paginator.component.html"
})
export class TraineeListPaginatorComponent {
  @Select(TraineesState.countTotal) countTotal$: Observable<number>;
  @Select(TraineesState.pageIndex) pageIndex$: Observable<number>;

  constructor(private store: Store) {}

  public paginateTrainees(event: PageEvent) {
    this.store.dispatch(new PaginateTrainees(event.pageIndex));
    this.store
      .dispatch(new GetTrainees())
      .pipe(take(1))
      .subscribe(() => this.store.dispatch(new UpdateTraineesRoute()));
  }
}
