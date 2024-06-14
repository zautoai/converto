import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { AvatarService } from '../../services/avatar.service';
import { LayoutService } from '../../services/layout.service';
import { Menu, NavService } from '../../services/nav.service';
import { SwitcherService } from '../../services/switcher.service';
import { BotService } from '../../services/bot.service';
import { RestService } from '../../services/rest.service';
import { API } from 'src/app/config/endpoint.config';
import { NotificationService } from '../../services/notification.service';
import { GLOBAL_IMAGES } from 'src/app/config/image.config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  GLOBAL_IMAGES = GLOBAL_IMAGES;
  public isCollapsed = true;
  public bots: any = [];
  botPresent = 0
  selectedBot: any;

  userData: any;

  newPassword: string = "";
  confirmPassword: string = "";

  @ViewChild('changeProfileModal') changeProfileModal: ElementRef | undefined;
  @ViewChild('changePasswordModal') changePasswordModal: ElementRef | undefined;

  constructor(
    private layoutService: LayoutService,
    public navServices: NavService,
    private modalService: NgbModal,
    public SwitcherService: SwitcherService,
    private router: Router,
    private auth: AuthService,
    private botservice: BotService,
    private restService: RestService,
    private notifService: NotificationService,
    private avatarService: AvatarService,
  ) {

    this.auth.event$.subscribe(data => {
      this.userData = this.auth.getUser();
    });
    let path = this.router.url;
    if (path.includes('agents')) {
      this.restService.getAll(API.main.agent)
        .subscribe((response: any) => {
          this.bots = response.data;
        }, (error) => {
          console.log(error);
        });
    }
  }

  totalMoney: any = 0
  totalLength = 1
  delectFunction = false
  getdelectData: any

  selectedImage: File | any = null;
  previewUrl: string | ArrayBuffer | any = null;

  passwordErrorText: string = "";

  price() {

  }


  ngOnInit(): void {
    this.navServices.items.subscribe((menuItems) => {
      this.items = menuItems;
    });
    // To clear and close the search field by clicking on body
    document.querySelector('.main-content')?.addEventListener('click', () => {
      this.clearSearch();
    })
    this.text = '';

    this.userData = this.auth.getUser();

    const agentId = this.navServices.getAgentIdFromUrl();
    this.selectedBot = agentId;

  }


  toggleSidebar() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
    document.querySelector("body")?.classList.toggle("sidenav-toggled", this.navServices.collapseSidebar);
  }


  open(content: any) {
    this.modalService.open(content, { backdrop: 'static', windowClass: 'modalCusSty', size: 'lg' })
  }

  toggleSwitcher() {
    this.SwitcherService.emitChange(true);
    document.querySelector('body')?.classList.remove("sidenav-toggled-open")
  }

  toggleSidebarNotification() {
    this.layoutService.emitSidebarNotifyChange(true);
  }

  signout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }


  // Search
  public menuItems!: Menu[];
  public items!: Menu[];
  public text!: string;
  public SearchResultEmpty: boolean = false;



  Search(searchText: any) {
    if (!searchText) return this.menuItems = [];
    // items array which stores the elements
    let items: any[] = [];
    // Converting the text to lower case by using toLowerCase() and trim() used to remove the spaces from starting and ending
    searchText = searchText.toLowerCase().trim();
    this.items.filter((menuItems: any) => {
      // checking whether menuItems having title property, if there was no title property it will return
      if (!menuItems?.title) return false;
      //  checking wheteher menuitems type is text or string and checking the titles of menuitems
      if (menuItems.type === 'link' && menuItems.title.toLowerCase().includes(searchText)) {
        // Converting the menuitems title to lowercase and checking whether title is starting with same text of searchText
        if (menuItems.title.toLowerCase().startsWith(searchText)) {// If you want to get all the data with matching to letter entered remove this line(condition and leave items.push(menuItems))
          // If both are matching then the code is pushed to items array
          items.push(menuItems);
        }
      }
      //  checking whether the menuItems having children property or not if there was no children the return
      if (!menuItems.children) return false;
      menuItems.children.filter((subItems: any) => {
        if (subItems.type === 'link' && subItems.title.toLowerCase().includes(searchText)) {
          if (subItems.title.toLowerCase().startsWith(searchText)) {         // If you want to get all the data with matching to letter entered remove this line(condition and leave items.push(subItems))
            items.push(subItems);
          }

        }
        if (!subItems.children) return false;
        subItems.children.filter((subSubItems: any) => {
          if (subSubItems.title.toLowerCase().includes(searchText)) {
            if (subSubItems.title.toLowerCase().startsWith(searchText)) {// If you want to get all the data with matching to letter entered remove this line(condition and leave items.push(subSubItems))
              items.push(subSubItems);
            }
          }
        })
        return;
      })
      return this.menuItems = items;
    });
    // Used to show the No search result found box if the length of the items is 0
    if (!items.length) {
      this.SearchResultEmpty = true;
    }
    else {
      this.SearchResultEmpty = false;
    }
    return;
  }

  //  Used to clear previous search result
  clearSearch() {
    this.text = '';
    this.menuItems = [];
    this.SearchResultEmpty = false;
    return this.text, this.menuItems
  }
  onBotChange(id: any) {
    let url = 'agents/' + id + "/agent";
    this.router.navigateByUrl(url);
  }

  changeProfile() {
    this.modalService.open(this.changeProfileModal, { centered: true, backdrop: 'static' });
  }

  changePassword() {
    this.modalService.open(this.changePasswordModal, { centered: true, backdrop: 'static' });
  }

  closeModal() {
    this.selectedImage = null;
    this.previewUrl = null;
    this.modalService.dismissAll();
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }
  

  onChangeProfileSubmit() {
    if (this.selectedImage) {
      const formData = new FormData();
      formData.append('file', this.selectedImage, this.selectedImage.name);
      this.restService.uploadFile(API.main.orgUser + '/profilePic', formData)
        .subscribe((response: any) => {
          this.closeModal();
          const newImgUrl = response.file.path;
          this.notifService.showSuccess("Profile picture changed!");
          if (newImgUrl) {
            this.auth.updateUser('imgUrl', newImgUrl);
          }
        }, (error) => {
          console.log(error);
        });
    }
  }

  onChangePassword() {
    this.passwordErrorText = "";
    if (this.newPassword.length > 0 && this.confirmPassword.length > 0 && this.userData) {
      if ((this.newPassword === this.confirmPassword)) {
        const data = { password: this.newPassword };

        this.restService.patch(API.main.orgUser, this.userData.id, data)
          .subscribe((response: any) => {
            this.modalService.dismissAll();
            this.notifService.showSuccess("Password updated successfully.");
            this.newPassword = "";
            this.confirmPassword = "";
          }, (error) => {
            console.log(error);
          });
      }
      else {
        this.passwordErrorText = "Confirm password does not match";
      }
    }
  }

  getAvatarUrl() {
    const url = API.baseUrl + "/zautobot?botid=" + this.avatarService.getAvatarId();
    return url;
  }

}
