// Imports
import {
  Component,
  Input,
  Output,
  ElementRef,
  ViewChild,
  EventEmitter,
  forwardRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as CodeMirror from 'codemirror';

/**
 * CodeMirror component
 * Usage :
 * <codemirror [(ngModel)]="data" [config]="{...}"></codemirror>
 */
@Component({
  selector: 'codemirror',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true
    }
  ],
  template: `<textarea #host></textarea>`,
})
export class EditorComponent implements AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constant Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Fixed mode
   * @type {string}
   */
  private MODE: string = 'text/x-sql';

  /**
   * 초기 옵션
   * @type {{mode: string; indentWithTabs: boolean; smartIndent: boolean; lineNumbers: boolean; matchBrackets: boolean; autofocus: boolean; extraKeys: {Ctrl-Space: string}}}
   */
  private config = {
    mode: this.MODE,
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    matchBrackets : true,
    autofocus: true,
    // {}에 옵션 추가할경우, 로 넣을것, []아님
    extraKeys: {"Ctrl-Space": "autocomplete"},
  };


  @ViewChild('host') host;

  @Output() editor = null;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // editor text
  private text: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Constructor
   */
  constructor() {}

  // 초기값 설정
  @Input() set value(v) {
    if (v !== this.text) {
      this.text = v;
      this.onChange(v);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * On component destroy
   */
  ngOnDestroy() {

  }

  /**
   * On component view init
   */
  ngAfterViewInit() {
    this.codemirrorInit(this.config);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Initialize codemirror
   */
  codemirrorInit(config) {
    this.editor = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.editor.setValue(this.text);
  }

  onChange(_) {}

  public getTest() {

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * line number 표시
   * @param isEnabled
   */
  public setLineNumber(isEnabled: boolean): void {
    this.changeOption('lineNumbers', isEnabled);
  }

  /**
   * auto focus
   * @param isEnabled
   */
  public setAutoFocus(isEnabled: boolean): void {
    this.changeOption('autoFocus', isEnabled);
  }

  /**
   * read only
   * @param isEnabled
   */
  public setReadOnly(isEnabled: boolean): void {
    this.changeOption('readOnly', isEnabled);
  }

  /**
   * 에디터 refresh
   */
  public setRefresh(): void {
    this.editor.refresh();
  }

  /**
   * 키 입력시 하단에 나타날 hint 설정
   * @param title
   * @param values
   * @param valueKey
   */
  public setHintOptions(title: string, values: any[], valueKey?: string) {
    const items = {};
    items[title] = valueKey ?  this.getHintValues(values, valueKey) : values;
    this.changeOption('hintOptions', {tables: items})
  };

  /**
   * 에디터 텍스트 입력
   * @param text
   */
  public setText(text:string): void {
    if (this.text !== text) {
      this.text = text || '';
      this.editor.setValue(this.text);
    }
  }

  /**
   * 현재 커서부분에 텍스트 입력후 포커스
   * @param text
   */
  public insertText(text: string): void {
    // text insert
    this.editor.replaceRange(text, this.getCursor);
    // focus
    this.editor.focus();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 모든 텍스트 가져오기
   * @returns {string}
   */
  public getAllText(): string {
    return this.editor.getValue();
  }

  /**
   * 현재 커서에서 선택된 아이템 가져오기
   * @returns {string}
   */
  public getFocusSelection(): string {
    // 현재 커서
    const cursor = this.getCursor;
    // 현재 모든 라인
    const lines = this.getLists;
    // 현재 커서 라인위치
    const lineCursor = cursor.line;
    // start end
    let qstart: number = -1;
    let qend: number = -1;

    let startPos = {line: 0, ch: 0};
    let endPos = {line: 0, ch: 0};
    // 현재 line에 ;가 있다면
    if (lines[lineCursor].indexOf(';') > -1) {
      // 처음까지 탐색
      for (let i = lineCursor - 1; i >= 0; i = i - 1) {
        // line에 ; 있다면
        if (lines[i].indexOf(';') > -1) {
          // ; 있으면
          qstart = i;
          startPos = {line: qstart + 1, ch: 0};
          endPos = {line: lineCursor + 1, ch: 0};
          // 영역 지정
          this.setSelection(startPos, endPos);
          break;
        }
      }
      // 없다면. 맨 처음 line 부터 시작
      if (qstart === -1) {
        startPos = {line: 0, ch: 0};
        endPos = {line: lineCursor + 1, ch: 0};
        // 영역 지정
        this.setSelection(startPos, endPos);
      }
    } else {
      // 현재 행에 ; 가 없을 경우.
      // 뒤로 조회
      for (let i = lineCursor; i < lines.length; i = i + 1) {
        if (lines[i].indexOf(';') > -1) {
          // ; 있으면
          qend = i;
          // 앞으로 조회
          for (let j = lineCursor; j >= 0; j = j - 1) {
            if (lines[j].indexOf(';') > -1) {
              // ; 있으면
              qstart = j;
              break;
            }
          }
          // 없다면
          if (qstart === -1) {
            qstart = 0;
            startPos = {line: qstart, ch: 0};
            endPos = {line: qend + 1, ch: 0};
            this.setSelection(startPos, endPos);
          } else {
            startPos = {line: qstart + 1, ch: 0};
            endPos = {line: qend + 1, ch: 0};
            this.setSelection(startPos, endPos);
          }
          break;
        }
        // 없다면.
        if (qend === -1) {
          // 뒤로 조회
          let cnt = 0;
          console.info('crow', lineCursor);
          for (let j = lineCursor; j >= 0; j = j - 1) {
            console.info('j', j);
            if (lines[j].indexOf(';') > -1 && cnt === 0) {
              // ; 있으면
              qend = j;
            }
            if (lines[j].indexOf(';') > -1 && cnt === 1) {
              qstart = j;
              break;
            }
            if (lines[j].indexOf(';') > -1) {
              cnt = cnt + 1;
            }
          }
          startPos = {line: qstart + 1, ch: 0};
          endPos = {line: qend + 1 , ch: 0};
        }
      }
    }
    return '';
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 커서 위치 가져오기
   * @returns {any}
   */
  private get getCursor() {
    return this.editor.getCursor();
  }

  /**
   * 현재 에디터의 모든 line 리스트 가져오기
   * @returns {any|string[]}
   */
  private get getLists() {
    return this.editor.getValue().split('\n');
  }

  /**
   * 현재 선택한 아이템 가져오기
   * @returns {any}
   */
  private get getSelection() {
    return this.editor.getSelection();
  }

  /**
   * 에디터에서 블럭 선택
   * @param startPos
   * @param endPos
   */
  private setSelection(startPos: any, endPos: any) {
    this.editor.setSelection(endPos, startPos);
  }

  /**
   * option 변경
   * @param optionName
   * @param value
   */
  private changeOption(optionName: string, value: any) {
    this.editor.setOption(optionName, value);
  }

  /**
   * get hint values
   * @param values
   * @param key
   * @returns {Array}
   */
  private getHintValues(values: any[], key: string) {
    const result = [];
    values.forEach((item) => {
      result.push(item[key]);
    });
    return result;
  }
}
