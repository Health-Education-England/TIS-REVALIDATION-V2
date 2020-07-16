import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { catchError, filter, take, tap } from "rxjs/operators";
import { SnackBarService } from "../../shared/services/snack-bar/snack-bar.service";
import {
  IRecommendationSummary,
  RecommendationType
} from "../recommendation-history.interface";
import { Get, Post } from "../state/recommendation-history.actions";
import { RecommendationHistoryState } from "../state/recommendation-history.state";

@Component({
  selector: "app-confirm-recommendation",
  templateUrl: "./confirm-recommendation.component.html"
})
export class ConfirmRecommendationComponent implements OnInit {
  public form: FormGroup;
  public gmcNumber: number;
  public recommendationId: string;
  public recommendationType = RecommendationType;

  @Select(RecommendationHistoryState.currentRecommendationType)
  public currentRecommendationType$: Observable<string>;

  @Select(RecommendationHistoryState.editRecommendation)
  public editRecommendation$: Observable<boolean>;

  @Select(RecommendationHistoryState.currentRecommendation)
  public currentRecommendation$: Observable<IRecommendationSummary>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store,
    private snackBarService: SnackBarService
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.getCurrentRecommendation();
  }

  public setupForm(): void {
    this.form = this.formBuilder.group({
      confirm: [false, Validators.requiredTrue]
    });
  }

  public submitToGMC(): void {
    this.store
      .dispatch(new Post(this.gmcNumber, this.recommendationId))
      .pipe(
        catchError(() =>
          of(
            this.snackBarService.openSnackBar("An error occurred! please retry")
          )
        ),
        tap(() =>
          of(
            this.snackBarService.openSnackBar(
              "Your recommendation was successfully submitted to GMC"
            )
          )
        )
      )
      .subscribe(() => {
        this.store
          .dispatch(new Get(this.gmcNumber))
          .subscribe(() => this.navigateToParent());
      });
  }

  public reset(): void {
    this.form.reset();
    this.navigateToParent();
  }

  private navigateToParent(): void {
    this.router.navigate(["../"], { relativeTo: this.activatedRoute });
  }

  private getCurrentRecommendation(): void {
    this.currentRecommendation$
      .pipe(
        filter((res) => res && res.recommendationId !== null),
        take(1)
      )
      .subscribe((currentRecommendation: IRecommendationSummary) => {
        if (currentRecommendation) {
          this.recommendationId = currentRecommendation.recommendationId;
          this.gmcNumber = Number(currentRecommendation.gmcNumber);
        }
      });
  }
}
