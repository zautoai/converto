import { Component } from '@angular/core';
export interface Icp {
  industry: string;
  companySize: string;
  annualRevenue: string;
  existingTechnology: string;
  contentConsumption: string;
  onlinePresence: string;
  businessProblems: string;
  goalsAndObjectives: string;
  desiredOutcomes: string;
  valueProposition: string;
  solutionFit: string;
}

@Component({
  selector: 'app-icpview',
  templateUrl: './icpview.component.html',
  styleUrl: './icpview.component.scss'
})

export class IcpviewComponent {
  icps: Icp[] = [
    {
      industry: 'Technology',
      companySize: '50-200 employees',
      annualRevenue: '$1 million - $10 million',
      existingTechnology: 'Salesforce, Marketo, HubSpot',
      contentConsumption: 'Whitepapers, Case Studies, Blog Posts',
      onlinePresence: 'LinkedIn, Twitter, Facebook',
      businessProblems:
        'Lack of visibility into sales and marketing performance, Difficulty in identifying and targeting ideal customer profiles',
      goalsAndObjectives:
        'Increase sales revenue, Improve marketing ROI, Improve customer engagement and retention',
      desiredOutcomes:
        'Improved sales and marketing performance, Increased customer engagement and retention, Improved customer satisfaction',
      valueProposition:
        'Provides a comprehensive solution for sales and marketing automation, Helps businesses identify and target their ideal customer profiles, Offers insights and analytics to improve sales and marketing performance',
      solutionFit:
        'Offers features for personalized marketing campaigns, Provides tools for efficient project management, Offers insights and analytics to improve sales and marketing performance'
    },
    {
      industry: 'Healthcare',
      companySize: '100-500 employees',
      annualRevenue: '$10 million - $50 million',
      existingTechnology: 'Epic, Cerner, Allscripts',
      contentConsumption: 'Webinars, Research Reports, Whitepapers',
      onlinePresence: 'LinkedIn, Twitter, Medium',
      businessProblems:
        'Difficulty in managing patient data, Lack of interoperability between systems, High cost of healthcare',
      goalsAndObjectives:
        'Improve patient outcomes, Reduce healthcare costs, Improve operational efficiency',
      desiredOutcomes:
        'Improved patient outcomes, Reduced healthcare costs, Improved operational efficiency, Improved patient satisfaction',
      valueProposition:
        'Provides a comprehensive solution for managing patient data, Enables interoperability between systems, Helps reduce healthcare costs',
      solutionFit:
        'Offers features for managing patient data, Enables interoperability between systems, Helps reduce healthcare costs'
    },
    // Add more ICP objects as needed
  ];
}
