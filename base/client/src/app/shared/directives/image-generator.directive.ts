import { Directive, ElementRef, Input, Renderer2, OnInit, SimpleChanges, OnChanges } from '@angular/core';


@Directive({
  selector: '[appProfilePicture]'
})
export class ImageGeneratorDirective implements OnInit, OnChanges{

  @Input('appProfilePicture') initials: string = '';
  canvas!: HTMLCanvasElement;

  colors: string[] = [
    '#828181',
  ];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.generateImage();
  }
  
  ngOnChanges(changes: SimpleChanges)
  {
    if (changes['initials'] && !changes['initials'].firstChange) {
      this.generateImage();
    }
  }
  
  generateImage()
  {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 100;
    this.canvas.height = 100;
  
    const ctx = this.canvas.getContext('2d');
    const color = this.generateColor(this.initials);
  
    // Draw a colored circle
    if(ctx)
    {
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, 2 * Math.PI);
      ctx.fillStyle = color; // You can change this color
      ctx.fill();
  
      // Display initials in the center
      ctx.fillStyle = 'white';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.getInitials(), 50, 50);
    }
  
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.canvas.toDataURL('image/png'));
    
  }

  getInitials(): string {
    const nameParts = this.initials.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toLocaleUpperCase();
    } else {
      return nameParts[0][0].toLocaleUpperCase();
    }
  }

  generateColor(initials: string): string {
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use the generated numerical value to pick a color from the predefined list
    const index = Math.abs(hash) % this.colors.length;
    return this.colors[index];
  }

}
