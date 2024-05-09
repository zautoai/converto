import { Directive, ElementRef, Input, Renderer2, SimpleChanges } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Directive({
  selector: '[appMarkdown]',
})
export class MarkdownDirective {
  @Input('appMarkdown') markdownContent!: string;
  private displayText = '';
  @Input() animationSpeed = 50;
  @Input() linkColor = '#FFFFFF'

  constructor(
    private el: ElementRef, 
    private markdownService: MarkdownService,
    private renderer: Renderer2
    ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if ('markdownContent' in changes) {
      if (this.animationSpeed === 0) {
        this.displayMarkdownDirectly();
      } else {
        this.animateTyping();
      }
    }
    
  }

  private async displayMarkdownDirectly() {
    if (this.markdownContent) {
      this.displayText = this.markdownContent;
      const parsedContent:any = this.markdownService.parse(this.displayText);
      const styledContent = await this.addCustomStyles(parsedContent);
        this.setInnerHTML(styledContent);
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', styledContent);
    }
  }
  
  private async animateTyping() {
    if (this.markdownContent) {
      this.displayText = '';
      const characters = this.markdownContent.split(''); 

      for (const char of characters) {
        this.displayText += char;
        const parsedContent: any = this.markdownService.parse(this.displayText);
        const styledContent = await this.addCustomStyles(parsedContent); 
        this.setInnerHTML(styledContent);
        await this.delay(this.animationSpeed);
      }
    }
  }

  private async addCustomStyles(content: string): Promise<string> {
    // await this.delay(100); 
    const styledContent = content.replace(/<a/g, `<a style="color: ${this.linkColor};text-decoration: underline;" target=blank`);
    return styledContent;
  }

  private setInnerHTML(content: string) {
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', content);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
