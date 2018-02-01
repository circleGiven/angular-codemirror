import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {EditorComponent} from "./component/editor.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(EditorComponent)
  editor: EditorComponent;

  public config = {
    mode: 'text/x-sql',
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    matchBrackets : true,
    autofocus: true,
    // {}에 옵션 추가할경우, 로 넣을것, []아님
    extraKeys: {"Ctrl-Space": "autocomplete"},
    hintOptions: {tables: {
      // 해당옵션.[]
      users: ["name", "score", "birthDate"],
      countries: ["name", "population", "size"]
    }}
  };

  public value = "SELECT * FROM information_schema.ALL_PLUGINS;\nSELECT * FROM\ninformation_schema.APPLICABLE_ROLES;";

  // Init
  public ngOnInit(): void {
  }

  // Destory
  public ngOnDestroy(): void {
  }

  // AfterViewInit
  public ngAfterViewInit(): void {
  }

  /**
   *
   * @param event
   */
  public editorKeyEvent(event) {
    // 부분 쿼리 실행
    if (event.altKey && event.keyCode === 13) {

    }
    // 모든 쿼리 실행
    if (event.ctrlKey && event.keyCode === 13) {
      this.editor.getTest();
    }
  }

  public test() {
    this.editor.getTest();
  }
}
