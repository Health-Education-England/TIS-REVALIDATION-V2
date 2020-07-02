import { Injectable } from "@angular/core";
import { State, Action, StateContext } from "@ngxs/store";
import { Get } from "./concern.actions";
import { ConcernService } from "../service/concern.service";
import { IConcernHistory, IConcernSummary } from "../concern-history.interface";
import { tap } from "rxjs/operators";

export class ConcernStateModel {
  public item: IConcernHistory;
}

@State<ConcernStateModel>({
  name: "concern",
  defaults: {
    item: {
      gmcNumber: null,
      concerns: []
    }
  }
})
@Injectable()
export class ConcernState {
  constructor(private service: ConcernService) {}

  @Action(Get)
  get({ patchState }: StateContext<ConcernStateModel>, { payload }: Get) {
    if (isNaN(payload)) {
      throw new Error(`gmcNumber ${payload} must be of type number`);
    }

    return this.service.getConcernHistory(payload).pipe(
      tap((result: IConcernHistory) => {
        patchState({
          item: result
        });
      })
    );
  }
}