import { Component, HostListener, OnInit,AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Menu, NavService } from 'src/app/shared/services/nav.service';
import { SwitcherService } from 'src/app/shared/services/switcher.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { RestService } from 'src/app/shared/services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { first } from 'rxjs';
import { SocketEventEnum, WebsocketService } from 'src/app/shared/services/websocket.service';
import { Socket, io } from 'socket.io-client'
import { SweetAlertService } from 'src/app/shared/services/sweet-alart.service';

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.scss']
})
export class ContentLayoutComponent implements OnInit, AfterViewInit {

  isLayoutReady:boolean = false;
  public menuItems!: Menu[];
  public socket!: Socket;
  @ViewChild('adminAudioPlayer') audioPlayerRef!: ElementRef;

  constructor(
    public SwitcherService: SwitcherService,
    public navServices: NavService, public router: Router,
    private authService:AuthService,
    private restService:RestService,
    public avatarService:AvatarService,
    private socketService:WebsocketService,
    private alertService: SweetAlertService
  ) {
    
    let path = router.url;
    // if(path.includes('agents')) {
    //   this.navServices.botItems.subscribe((menuItems: any[]) => {
    //     menuItems = menuItems.map(item => {
    //       if(item.path && item.path.includes(':id')) {
    //         item.path = item.path.replace(':id', localStorage.getItem('botId'));
    //       }
    //     });
    //     this.menuItems = menuItems;
    //   });
    // } else {
    //   this.navServices.items.subscribe((menuItems: any) => {
    //     this.menuItems = menuItems;
    //   });
    // }
  }
  ngOnInit() {
    document.querySelector(".slide-leftRTL")?.classList.add("d-none")
    document.querySelector(".slide-rightRTL")?.classList.add("d-none")

    this.verifyAuth();
    this.socketService.connectSocket();
    this.socketService.registerCustomEvent('customerRequest', SocketEventEnum.CUSTOMERREQUEST)
        .subscribe((data: any) => {
          if(data.event == 'CUSTOMERREQUEST')  {
            this.notifyUser(data)
          }
        });
  }

  notifyUser(customerRequest: any) {
    this.alertService.info('Customer Calling', 
    `${customerRequest.name} is requesting for your support.`, ['Accept', 'Reject'], (confirm)=>{
      audioPlayer.pause();
      if(confirm.isConfirmed) {
        this.socketService.emitEvent('suspendAI', {convId: customerRequest.convId});
        setTimeout(() => {
          this.router.navigate([`conversations/${customerRequest.convId}`]);
        }, 1000)
      }
    })
    //this.notificationService.showCallingInfo('Customer is calling...');
    const audioPlayer: HTMLAudioElement = this.audioPlayerRef.nativeElement;
    audioPlayer.play();
  }
  
  ngAfterViewInit(): void {
      
  }

  verifyAuth()
  {
    const data:any = this.restService.getAll(API.main.verify)
    .subscribe((data:any)=>{
      this.avatarService.setAvatarData(data.avatar);        
      this.authService.setUser(data.user);    
      if(!data.user.verified)
      {
        this.authService.logout();
      }
      this.isLayoutReady = true;
    },(error)=>{
      console.log(error);
      this.authService.logout();
    });
  }

  toggleSwitcherBody() {
    document.querySelectorAll(".slide-menu").forEach((ele)=>{
      if(ele.classList.contains("open")){
        // ele.classList.remove("open");
        // // Icon Change
        // ele.parentElement?.classList.remove("is-expanded")
        // let Icon :any = ele.parentElement?.querySelector(".side-menu__item")?.querySelectorAll("i")[1];
      }
    })

    this.SwitcherService.emitChange(false);

  }
  ngOnDestroy(){
    location.reload()
  }
  scrolled: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 74;
  }
}
