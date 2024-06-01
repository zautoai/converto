import { Component, Input, OnChanges, SimpleChanges, input } from '@angular/core';
import { InputTypes } from '../types';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'advanced-input',
  templateUrl: './advanced-input.component.html',
  styleUrl: './advanced-input.component.scss'
})
export class AdvancedInputComponent implements OnChanges{

  @Input() label: string = '';
    @Input() toolTips: string = '';
    @Input() control:FormControl = new FormControl();
    @Input() type: InputTypes = 'text';
    @Input() placeholder: string = '';
    @Input() size: string = 'sm';
    @Input() showIsValid: boolean = false;
    @Input() showIsInvalid: boolean = true;
    @Input() errorMessages!: { [key: string]: string };
    @Input() isDisabled: boolean = false;
    @Input() badgeText: string | null = null;
    @Input() toggleVisibility: boolean = false;
    @Input() rows:number = 3;
    show:boolean = false;

    private static idCounter = 0;
    private uniqueId: string;

    constructor() {
        this.uniqueId = `input-${AdvancedInputComponent.idCounter++}`;
    }

    get isRequired(): boolean {
        return !!this.control?.validator?.({} as FormControl)?.['required'];
    }

    hasError(error: string) {
        return this.control.dirty && this.control.hasError(error);
    }

    hasToolTips(): boolean {
        return !!this.toolTips;
    }

    getErrorMessage() {
        for (const errorKey in this.errorMessages) {
        if (this.control.hasError(errorKey)) {
            return this.errorMessages[errorKey];
        }
        }
        return '';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isDisabled']) {
            this.toggleControl();
        }
    }

    toggleControl() {
        if (this.isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    }

    get id():string
    {
        return this.uniqueId;
    }
}
