import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

//role
export enum Role {
	SUPERADMIN = 'superadmin',
	ADMIN = 'admin',
	USER = 'user',
}

// Menu
export interface Menu {
	headTitle?: string,
	headTitle2?: string,
	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeValue?: string;
	badgeClass?: string;
	active?: boolean;
	bookmark?: boolean;
	children?: Menu[];
	Menusub?: boolean;
	target?: boolean
	show?: boolean
	roles?: string[];
}

@Injectable({
	providedIn: 'root'
})

export class NavService implements OnDestroy {

	private unsubscriber: Subject<any> = new Subject();
	public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

	// Search Box
	public search: boolean = false;

	// Language
	public language: boolean = false;

	// Mega Menu
	public megaMenu: boolean = false;
	public levelMenu: boolean = false;
	public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

	// Collapse Sidebar
	public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

	// For Horizontal Layout Mobile
	public horizontal: boolean = window.innerWidth < 991 ? false : true;

	// Full screen
	public fullScreen: boolean = false;

	constructor(private router: Router, private location: Location) {
		this.setScreenWidth(window.innerWidth);
		fromEvent(window, 'resize').pipe(
			debounceTime(1000),
			takeUntil(this.unsubscriber)
		).subscribe((evt: any) => {
			this.setScreenWidth(evt.target.innerWidth);
			if (evt.target.innerWidth < 991) {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			}
			if (evt.target.innerWidth < 1199) {
				this.megaMenuColapse = true;
			}
		});
		if (window.innerWidth < 991) { // Detect Route change sidebar close
			this.router.events.subscribe(event => {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			});
		}
	}

	ngOnDestroy() {
		this.unsubscriber.next;
		this.unsubscriber.complete();
	}

	private setScreenWidth(width: number): void {
		this.screenWidth.next(width);
	}

	SETUPMENUITEMS: Menu[] = [
		{
			headTitle: 'Setup',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERADMIN]
		},
		{
			title: 'Setup', icon: 'fe fe-gitlab', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/setup', type: 'link', show: true, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERADMIN]
		},
	];

	MENUITEMS: Menu[] = [
		{
			title: 'Dashboard', icon: 'fa-solid fa-chart-line', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/dashboard', type: 'link'
		},
		{
			title: 'Engagements', icon: 'fa-solid fa-comments', active: false,type:'sub',
			children:[
				{
					title: 'Conversations', icon: 'fa-solid fa-comments', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/conversations', type: 'link'
				},
				{
					title: 'Accounts', icon: 'fa-regular fa-building', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/accounts', type: 'link'
				},
				{
					title: 'Contacts', icon: 'fe fe-user', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/contacts', type: 'link'
				},
			]
		},
		{
			title: 'Marketing', icon: 'fa-solid fa-bullseye', active: false, type:'sub',
			children:[
				{
					title: 'ABM', icon: 'fa-solid fa-bullseye', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/abm', type: 'link'
				},
				{
					title: 'FormBuilder', icon: 'fa-solid fa-cube', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/form-builder', type: 'link'
				},
				{
					title: 'Campaigns', icon: 'fe fe-award', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/campaigns', type: 'link'
				},
				{
					title: 'Traffic', icon: 'fa-solid fa-chart-line', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/visitors', type: 'link'
				},
				{
					title: 'Segment', icon: 'fa-solid fa-object-ungroup', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/segment', type: 'link'
				},
				{
					title: 'ICP', icon: 'fa-solid fa-user-check', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/icp', type: 'link'
				},
				{
					title: 'Intent scoring', icon: 'fa-solid fa-object-ungroup', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/intent-scoring', type: 'link'
				},
			]
		},
		{
			title: 'Sales', icon: 'fe fe-layers', active: false, type:'sub',
			children:[
				{
					title: 'Playbook', icon: 'fe fe-layers', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/sales-playbook', type: 'link'
				},
				{
					title: 'Lead settings', icon: 'fa-solid fa-sliders', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/lead-settings', type: 'link'
				},
				{
					title: 'CTA (Call-to-Action)', icon: 'fe fe-check-circle', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/call-to-action', type: 'link'
				},
				{
					title: 'Starters', icon: 'fa-regular fa-circle-play', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/starters', type: 'link'
				},
			]
		},
		{
			title: 'Configuration', icon: 'fa-regular fa-envelope', active: false, type:'sub',
			children:[
				{
					title: 'SMTP (Email Integration)', icon: 'fa-regular fa-envelope', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/smtp', type: 'link'
				},
		
				{
					title: 'Plugins', icon: 'fa-solid fa-plug', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/plugins', type: 'link'
				},
			]
		},
		{
			title: 'Calendar', icon: 'fa-solid fa-calendar-check', active: false, type:'sub',
			children:[
				{
					title: 'Events', icon: 'fa-solid fa-calendar-check', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/calendar-events', type: 'link'
				},
			]
		},
		{
			title: 'Data management', icon: 'fe fe-link', active: false, type:'sub',
			children:[
				{
					title: 'Sites', icon: 'fe fe-link', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/sites', type: 'link'
				},
				{
					title: 'File manager', icon: 'fa-solid fa-folder', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/file-manager', type: 'link'
				},
			]
		},
		{
			title: 'Deployment', icon: 'fa-solid fa-paintbrush', active: false, type:'sub',
			children:[
				{
					title: 'Customize & Deploy', icon: 'fa-solid fa-paintbrush', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/customize-avatar', type: 'link'
				},
			]
		},
		{
			title: 'Team Management', icon: 'fe fe-user', active: false, type:'sub',
			children:[
				{
					title: 'Team', icon: 'fe fe-user', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/team', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN]
				},
			]
		},
	];



	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);

	setupMenuItems = new BehaviorSubject<Menu[]>(this.SETUPMENUITEMS);

	getAgentIdFromUrl() {
		const url = this.location.path();
		const id = url.split('/')[2];
		return id;
	}

}

