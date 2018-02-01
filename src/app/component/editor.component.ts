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

  @Input() config;
  @Output() change = new EventEmitter();

  @ViewChild('host') host;

  @Output() editor = null;

  _value = '';

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

  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
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
    this.config = this.config || {};
    this.codemirrorInit(this.config);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
   * Initialize codemirror
   */
  codemirrorInit(config) {
    this.editor = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.editor.setValue(this._value);
  }

  /**
   * Value update process
   */
  updateValue(value) {
    this.value = value;
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value) {
    this._value = value || '';
    if (this.editor) {
      this.editor.setValue(this._value);
    }
  }
  onChange(_) {}
  onTouched() {}
  registerOnChange(fn) { this.onChange = fn; }
  registerOnTouched(fn) { this.onTouched = fn; }

  /**
   * 모든 텍스트 가져오기
   * @returns {string}
   */
  public getAllText(): string {
    return this.editor.getValue();
  }

  public getTest() {
    // this.getFocusSelection();
    // console.log(this.getSelection);
    console.log(this.getCursor);

    this.insert('texttse');
  }



  /**
   * 현재 커서부분에 텍스트 입력후 포커스
   * @param text
   */
  public insert(text: string): void {
    // text insert
    this.editor.replaceRange(text, this.getCursor);
    // focus
    this.editor.focus();
  }

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

  private setSelection(startPos: any, endPos: any) {
    this.editor.setSelection(endPos, startPos);
  }



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
}
