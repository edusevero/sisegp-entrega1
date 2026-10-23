import { Component, inject } from "@angular/core";
import { TJRSAngularMaterialModule, TJRSAuthService, TJRSNoteComponent } from "@ditic/modelo-ui-lib";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  imports: [TJRSAngularMaterialModule, TJRSNoteComponent],
})
export class HomeComponent {
  auth = inject(TJRSAuthService);
}
