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
			title: 'Dashboard', icon: 'fe fe-home', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/dashboard', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERADMIN]
		},
		{
			headTitle: 'ENGAGEMENTS',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Conversations', icon: 'fa-solid fa-comments', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/conversations', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},


		{
			title: 'Accounts', icon: 'fa-regular fa-building', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/accounts', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Contacts', icon: 'fe fe-user', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/contacts', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			headTitle: 'MARKETING',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'ABM', icon: 'fa-solid fa-bullseye', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/abm', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'FormBuilder', icon: 'fa-solid fa-cube', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/form-builder', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Campaigns', icon: 'fe fe-award', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/campaigns', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Traffic', icon: 'fa-solid fa-chart-line', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/visitors', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.SUPERADMIN]
		},
		{
			headTitle: 'SALES',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Playbook', icon: 'fe fe-layers', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/sales-playbook', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Lead settings', icon: 'fa-solid fa-sliders', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/lead-settings', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'CTA (Call-to-Action)', icon: 'fe fe-check-circle', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/call-to-action', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Starters', icon: 'fa-regular fa-circle-play', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/starters', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			headTitle: 'CONFIGURATION',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		// {
		// 	title: 'Settings', icon: 'fe fe-settings', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/settings', type: 'link',show:false ,roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		// {
		// 	title: 'Categories', icon: 'fe fe-award', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/lead-categories', type: 'link',show:false ,roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		// {
		// 	title: 'Platforms', icon: 'fe fe-share-2', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/platforms', type: 'link',show:false ,roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		{
			title: 'SMTP (Email Integration)', icon: 'fa-regular fa-envelope', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/smtp', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		// {
		// 	title: 'Integrations', icon: 'fe fe-download', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/integrations', type: 'link',show:false ,roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		{
			title: 'Plugins', icon: 'fa-solid fa-plug', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/plugins', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			headTitle: 'Calendar',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		// {
		// 	title: 'Calendar (Scheduling)', icon: 'fa-solid fa-calendar', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/calendar', type: 'link',show:false ,roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		{
			title: 'Calendar (Events)', icon: 'fa-solid fa-calendar-check', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/calendar-events', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		// {
		// 	headTitle: 'CRM',
		// 	show:false,
		// 	roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		// {
		// 	title: 'Hubspot', icon: 'fa fa-hubspot', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/hubspot', type: 'link',show:false ,roles:[Role.SUPERADMIN,Role.ADMIN,Role.USER]
		// },
		{
			headTitle: 'DATA MANAGEMENT',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Sites', icon: 'fe fe-link', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/sites', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'File manager', icon: 'fa-solid fa-folder', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/file-manager', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Segment', icon: 'fa-solid fa-object-ungroup', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/segment', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'ICP', icon: 'fa-solid fa-user-check', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/icp', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Intent scoring', icon: 'fa-solid fa-object-ungroup', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/intent-scoring', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			headTitle: 'Deployment',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			title: 'Customize & Deploy', icon: 'fa-solid fa-paintbrush', active: false, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/customize-avatar', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN, Role.USER]
		},
		{
			headTitle: 'Team Management',
			show: false,
			roles: [Role.SUPERADMIN, Role.ADMIN]
		},
		{
			title: 'Team', icon: 'fe fe-user', active: true, badgeClass: 'badge badge-sm bg-secondary badge-hide', badgeValue: 'new', path: '/team', type: 'link', show: false, roles: [Role.SUPERADMIN, Role.ADMIN]
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

