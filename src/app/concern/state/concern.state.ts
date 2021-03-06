import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { patch, updateItem } from "@ngxs/store/operators";
import { saveAs } from "file-saver";
import {
  catchError,
  finalize,
  map,
  switchMap,
  take,
  tap
} from "rxjs/operators";
import { SnackBarService } from "../../shared/services/snack-bar/snack-bar.service";
import {
  IConcernSummary,
  IEntity,
  IFileUploadProgress,
  IGetConcernResponse,
  IListFile
} from "../concern.interfaces";
import { defaultConcern } from "../constants";
import { ConcernService } from "../services/concern/concern.service";
import { UploadService } from "../services/upload/upload.service";
import {
  ApiError,
  DeleteFile,
  DeleteFileSuccess,
  DownloadFile,
  DownloadFileSuccess,
  Get,
  ListFiles,
  ListFilesSuccess,
  Save,
  SaveSuccess,
  SetFileUploadProgress,
  SetSelectedConcern,
  Upload,
  UploadSuccess
} from "./concern.actions";
import { Observable, forkJoin } from "rxjs";
import {
  HttpEvent,
  HttpProgressEvent,
  HttpEventType,
  HttpResponse
} from "@angular/common/http";

export class ConcernStateModel {
  public employers?: IEntity[];
  public filesInUploadProgress?: IFileUploadProgress[];
  public gmcNumber: number;
  public grades?: IEntity[];
  public history: IConcernSummary[];
  public sources?: IEntity[];
  public concernTypes?: IEntity[];
  public listFilesInProgress?: boolean;
  public selected?: IConcernSummary;
  public sites?: IEntity[];
  public uploadedFiles?: any[];
  public uploadFileInProgress?: boolean;
}

@State<ConcernStateModel>({
  name: "concern",
  defaults: {
    gmcNumber: null,
    history: []
  }
})
@Injectable()
export class ConcernState {
  constructor(
    private service: ConcernService,
    private uploadService: UploadService,
    private concernService: ConcernService,
    private snackBarService: SnackBarService
  ) {}

  @Selector()
  public static concernTypes(state: ConcernStateModel) {
    return state.concernTypes;
  }

  @Selector()
  public static sources(state: ConcernStateModel) {
    return state.sources;
  }

  @Selector()
  public static employers(state: ConcernStateModel) {
    return state.employers;
  }

  @Selector()
  public static grades(state: ConcernStateModel) {
    return state.grades;
  }

  @Selector()
  public static sites(state: ConcernStateModel) {
    return state.sites;
  }

  @Selector()
  public static uploadFileInProgress(state: ConcernStateModel) {
    return state.uploadFileInProgress;
  }

  @Selector()
  public static listFilesInProgress(state: ConcernStateModel) {
    return state.listFilesInProgress;
  }

  @Selector()
  public static uploadedFiles(state: ConcernStateModel) {
    return state.uploadedFiles;
  }

  @Selector()
  public static gmcNumber(state: ConcernStateModel) {
    return state.gmcNumber;
  }

  @Selector()
  public static history(state: ConcernStateModel) {
    return state.history;
  }

  @Selector()
  public static selected(state: ConcernStateModel) {
    return state.selected;
  }

  @Selector()
  public static filesInUploadProgress(state: ConcernStateModel) {
    return state.filesInUploadProgress;
  }

  @Action(Get)
  get({ patchState }: StateContext<ConcernStateModel>, { payload }: Get) {
    if (isNaN(payload)) {
      throw new Error(`gmcNumber ${payload} must be of type number`);
    }

    return this.service.getConcernHistory(payload).pipe(
      map((response: IGetConcernResponse) => {
        patchState({
          gmcNumber: response.gmcNumber,
          history: response.concerns,
          employers: this.concernService.massageData(
            response.employers,
            "trustName"
          ),
          grades: this.concernService.massageData(response.grades, "name"),
          sites: this.concernService.massageData(response.sites, "siteName"),
          sources: this.concernService.massageData(response.sources, "name"),
          concernTypes: this.concernService.massageData(
            response.types,
            "label"
          ),
          selected: {
            ...defaultConcern,
            gmcNumber: response.gmcNumber
          }
        });
      })
    );
  }

  @Action(SetSelectedConcern)
  setSelected(
    ctx: StateContext<ConcernStateModel>,
    { concern }: SetSelectedConcern
  ) {
    ctx.patchState({
      selected: concern
    });
  }

  @Action(Save)
  addConcern(ctx: StateContext<ConcernStateModel>) {
    const state = ctx.getState();
    const selectedConcern = state.selected;
    return this.concernService
      .addConcern(selectedConcern)
      .pipe(
        take(1),
        catchError((error: string) => ctx.dispatch(new ApiError(error)))
      )
      .pipe(map((response: string) => ctx.dispatch(new SaveSuccess(response))));
  }

  @Action(SaveSuccess)
  saveSuccess(ctx: StateContext<ConcernStateModel>, action: SaveSuccess) {
    this.snackBarService.openSnackBar("Concern successfully saved.");

    ctx.patchState({
      selected: {
        ...ctx.getState().selected,
        concernId: action.payload
      }
    });
  }

  @Action(SetFileUploadProgress)
  setFileUploadProgress(
    ctx: StateContext<ConcernStateModel>,
    action: SetFileUploadProgress
  ) {
    const state = ctx.getState();
    const uploadInProgress = action.upFile ? true : false;
    if (uploadInProgress) {
      if (action.progress === 0) {
        ctx.patchState({
          uploadFileInProgress: uploadInProgress,
          filesInUploadProgress: [
            ...state.filesInUploadProgress,
            { file: action.upFile, progress: action.progress }
          ]
        });
      } else {
        ctx.setState(
          patch({
            filesInUploadProgress: updateItem<IFileUploadProgress>(
              (item) => item.file === action.upFile,
              {
                file: action.upFile,
                progress: action.progress
              }
            )
          })
        );
      }
    } else {
      ctx.patchState({
        uploadFileInProgress: uploadInProgress,
        filesInUploadProgress: []
      });
    }
  }

  @Action(Upload)
  upload(ctx: StateContext<ConcernStateModel>, action: Upload) {
    const uploadFiles: Observable<any>[] = [];
    ctx.dispatch(new SetFileUploadProgress(null, null));
    action.payload.map((upFile: File) => {
      ctx.dispatch(new SetFileUploadProgress(upFile, 0));
    });
    if (action.gmcNumber && action.concernId) {
      action.payload.map((upFile: File) => {
        uploadFiles.push(
          this.uploadService
            .upload(
              this.uploadService.createFormData(
                action.gmcNumber,
                action.concernId,
                upFile
              )
            )
            .pipe(
              map((event: HttpEvent<HttpProgressEvent>) => {
                switch (event.type) {
                  case HttpEventType.UploadProgress:
                    ctx.dispatch(
                      new SetFileUploadProgress(
                        upFile,
                        Math.round((event.loaded * 100) / event.total)
                      )
                    );
                    break;
                  case HttpEventType.Response:
                    return event;
                }
              })
            )
        );
      });
      return forkJoin(uploadFiles)
        .pipe(
          take(1),
          tap((val: HttpResponse<any>[]) => {
            ctx
              .dispatch(new UploadSuccess(action.gmcNumber, action.concernId))
              .subscribe(() => {
                if (val.includes(undefined)) {
                  return ctx.dispatch(new ApiError(`An error occured`));
                }
              });
          }),
          catchError((error: string) => {
            return ctx.dispatch(new ApiError(error));
          }),
          finalize(() => {
            ctx.dispatch(new ListFiles(action.gmcNumber, action.concernId));
            return ctx.dispatch(new SetFileUploadProgress(null, null));
          })
        )
        .subscribe();
    }
  }

  @Action(UploadSuccess)
  uploadSuccess(ctx: StateContext<ConcernStateModel>, action: UploadSuccess) {
    this.snackBarService.openSnackBar(`Upload success`);
    return ctx.dispatch(new ListFiles(action.gmcNumber, action.concernId));
  }

  // TODO move to a generic place so other states can also re use
  @Action(ApiError)
  apiError(_ctx: StateContext<ConcernStateModel>, action: ApiError) {
    return this.snackBarService.openSnackBar(action.error);
  }

  @Action(ListFiles)
  listFiles(ctx: StateContext<ConcernStateModel>, action: ListFiles) {
    ctx.patchState({
      listFilesInProgress: true
    });

    return this.uploadService
      .listFiles(
        this.uploadService.createListFilesParams(
          action.gmcNumber,
          action.concernId
        )
      )
      .pipe(
        take(1),
        catchError((error: string) => ctx.dispatch(new ApiError(error))),
        finalize(() =>
          ctx.patchState({
            listFilesInProgress: false
          })
        )
      )
      .subscribe((response: IListFile[]) =>
        ctx.dispatch(new ListFilesSuccess(response))
      );
  }

  @Action(ListFilesSuccess)
  listFilesSuccess(
    ctx: StateContext<ConcernStateModel>,
    action: ListFilesSuccess
  ) {
    return ctx.patchState({
      uploadedFiles: action.uploadedFiles
    });
  }

  @Action(DownloadFile)
  downloadFile(ctx: StateContext<ConcernStateModel>, action: DownloadFile) {
    return this.uploadService
      .downloadFile(this.uploadService.createRequestParams(action.key))
      .pipe(
        take(1),
        switchMap((blob: Blob) =>
          ctx.dispatch(new DownloadFileSuccess(blob, action.fileName))
        ),
        catchError((error: string) => ctx.dispatch(new ApiError(error)))
      )
      .subscribe();
  }

  @Action(DownloadFileSuccess)
  downloadFileSuccess(
    _ctx: StateContext<ConcernStateModel>,
    action: DownloadFileSuccess
  ) {
    saveAs(action.blob, action.fileName);
  }

  @Action(DeleteFile)
  deleteFile(ctx: StateContext<ConcernStateModel>, action: DeleteFile) {
    return this.uploadService
      .deleteFile(this.uploadService.createRequestParams(action.key))
      .pipe(
        take(1),
        catchError((error: string) => ctx.dispatch(new ApiError(error)))
      )
      .subscribe(() =>
        ctx
          .dispatch(new DeleteFileSuccess(action.fileName))
          .pipe(take(1))
          .subscribe(() => {
            const gmcno = ctx.getState().gmcNumber;
            const conId = ctx.getState().selected.concernId;
            return ctx.dispatch(new ListFiles(gmcno, conId));
          })
      );
  }

  @Action(DeleteFileSuccess)
  deleteFileSuccess(action: DeleteFileSuccess) {
    this.snackBarService.openSnackBar(`${action.fileName} has been deleted`);
  }
}
