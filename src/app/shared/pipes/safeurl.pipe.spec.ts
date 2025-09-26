import { SafeUrlPipe } from './safeurl.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const sanitizerMock = {
      bypassSecurityTrustResourceUrl: (url: string) => url
    } as unknown as DomSanitizer;

    const pipe = new SafeUrlPipe(sanitizerMock);
    expect(pipe).toBeTruthy();
  });
});