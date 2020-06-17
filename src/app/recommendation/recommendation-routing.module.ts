import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RecordDetailsComponent } from "../shared/details/record-details/record-details.component";
import { ConfirmRecommendationComponent } from "./confirm-recommendation/confirm-recommendation.component";
import { CreateRecommendationComponent } from "./create-recommendation/create-recommendation.component";
import { RecommendationTableComponent } from "./recommendation-table/recommendation-table.component";
import { RecommendationResolver } from "./recommendation.resolver";

const routes: Routes = [
  {
    path: "",
    component: RecordDetailsComponent,
    data: { title: "Recommendation summary" },
    resolve: { recommendation: RecommendationResolver },
    children: [
      {
        path: "",
        component: RecommendationTableComponent,
        data: { title: "Recommendation history" }
      },
      // TODO double check if a guard and/resolver is needed on this route
      {
        path: "create",
        component: CreateRecommendationComponent,
        data: { title: "Create recommendation" } // TODO double check if a guard is needed here
      },
      // TODO double check if a guard and/resolver is needed on this route
      {
        path: "confirm",
        component: ConfirmRecommendationComponent,
        data: { title: "Confirm recommendation" }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecommendationRoutingModule {}