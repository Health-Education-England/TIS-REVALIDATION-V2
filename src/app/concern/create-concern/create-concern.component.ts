import { Component, OnInit } from "@angular/core";
import { FormGroup, FormArray } from "@angular/forms";
import { CommentsService } from "src/app/shared/details/comments-tool-bar/comments.service";
import { Store } from "@ngxs/store";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { map, tap } from "rxjs/operators";
import { defaultConcern, IConcernSummary } from "../concern-history.interface";
import { environment } from "@environment";

@Component({
  selector: "app-create-concern",
  templateUrl: "./create-concern.component.html",
  styleUrls: ["./create-concern.component.scss"]
})
export class CreateConcernComponent implements OnInit {
  dateFormat = environment.dateFormat;
  uploadedFiles = [
    {
      name: "Photos",
      updated: new Date("1/1/20"),
      type: "image"
    },
    {
      name: "Document",
      updated: new Date("1/17/19"),
      type: "doc"
    },
    {
      name: "Portable document format",
      updated: new Date("1/28/18"),
      type: "pdf"
    }
  ];
  concernForm: FormGroup;
  comments: FormArray;
  concernId: number;
  editMode: boolean;
  public concern$: Observable<
    IConcernSummary
  > = this.store.select((concernState) =>
    concernState.concern.item.concerns.find(
      (concern: IConcernSummary) => concern.concernId === this.concernId
    )
  );
  private concern: IConcernSummary;
  constructor(
    private commentsService: CommentsService,
    private store: Store,
    private activatedRoute: ActivatedRoute
  ) {}

  downloadDocument(event: Event): void {
    event.preventDefault();
    (window as any).alert("Your download should resume by next sprint 😀");
  }

  ngOnInit(): void {
    this.initialiseData();
  }

  private initialiseData(): void {
    this.concernId = Number(this.activatedRoute.snapshot.params.concernId);
    this.editMode = this.concernId ? true : false;

    this.concern$
      .pipe(
        tap((res: IConcernSummary) => {
          this.concern = res
            ? Object.assign({}, res)
            : Object.assign({}, defaultConcern);
          this.initialiseForm();
        })
      )
      .subscribe();
  }

  private initialiseForm(): void {
    this.concernForm = new FormGroup({});
    this.createCommentControls();
  }
  /**
   * creates a comments FormGroup for each comment
   * adds an empty comment FormGroup for readily adding comment
   */
  private createCommentControls(): void {
    this.comments = new FormArray([]);
    this.commentsService.comments = this.comments;
    if (this.concern.comments) {
      for (const comment of this.concern.comments) {
        this.commentsService.addCommentControl(comment);
      }
    }
    this.commentsService.addCommentControl();
    this.concernForm.addControl("comments", this.comments);
  }
}
