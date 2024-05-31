import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appToggleTheme]'
})
export class ToggleThemeDirective {
  private body:HTMLBodyElement | any = document.querySelector('body');
  constructor() { }

  @HostListener('click') toggleTheme(){

    if (this.body != !this.body) {
      this.body.classList.toggle('dark-mode');
      this.body.classList.remove('bg-img1');
      this.body.classList.remove('bg-img2');
      this.body.classList.remove('bg-img3');
      this.body.classList.remove('bg-img4');
      if(this.body.classList.contains("dark-mode")){
        this.body.classList.remove('light-menu');
        this.body.classList.remove('light-header');
        let DarkBtn : any = document.querySelector("#myonoffswitch2")
        DarkBtn.checked = true
        localStorage.setItem("Slicadark-theme","true")
        localStorage.removeItem("Slicalight-theme")
      }else{
        this.body.classList.remove('dark-menu');
        this.body.classList.remove('dark-header');
        let LightBtn : any = document.querySelector("#myonoffswitch1")
        LightBtn.checked = true
        localStorage.setItem("Slicalight-theme","true")
        localStorage.removeItem("Slicadark-theme")
      }
    }
  }
}
