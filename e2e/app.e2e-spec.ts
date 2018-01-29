import { CodeMirrorEditorPage } from './app.po';

describe('code-mirror-editor App', () => {
  let page: CodeMirrorEditorPage;

  beforeEach(() => {
    page = new CodeMirrorEditorPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
