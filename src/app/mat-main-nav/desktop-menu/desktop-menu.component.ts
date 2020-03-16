import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { menuItems } from "../menu-items.const";
import { IMenuItem } from "../menu-item.interface";
import { environment } from "@environment";

@Component({
  selector: "app-desktop-menu",
  templateUrl: "./desktop-menu.component.html",
  styleUrls: ["./desktop-menu.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class DesktopMenuComponent implements OnInit {
  menuItems$: IMenuItem[] = menuItems;
  hostURI: string = environment.adminsUIHostUri;

  constructor() {}

  ngOnInit(): void {}
}
