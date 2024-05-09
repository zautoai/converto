import { Component, inject, EventEmitter, Output, Input } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';



@Component({
	selector: 'app-date-range-selection',
	templateUrl: './date-range-selection.component.html',
	styleUrls: ['./date-range-selection.component.scss']
})
export class DateRangeSelectionComponent {

	calendar = inject(NgbCalendar);
	formatter = inject(NgbDateParserFormatter);

	hoveredDate: NgbDate | null = null;
	@Input() fromDate: NgbDate | null = null;
	@Input() toDate: NgbDate | null = null;

	@Input() set value(dateRange: { fromDate: number | null, toDate: number | null }) {
		
		this.fromDate = dateRange.fromDate ? this.convertTimestampToNgbDate(dateRange.fromDate) : null;
		this.toDate = dateRange.toDate ? this.convertTimestampToNgbDate(dateRange.toDate) : null;
	}

	@Output() datesEvent = new EventEmitter<any>();

	onDateSelection(date: NgbDate) {
		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
			this.toDate = date;
		} else {
			this.toDate = null;
			this.fromDate = date;
		}

		let fromDateTimestamp = this.fromDate ? new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime() : null;
		let toDateTimestamp = this.toDate ? new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime() : null;
		if (this.fromDate) {
			let fromDateObj = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
			fromDateObj.setHours(23, 59, 59, 999);

			fromDateTimestamp = fromDateObj.getTime();
		}

		if (this.toDate) {
			let toDateObj = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
			toDateObj.setHours(23, 59, 59, 999);

			toDateTimestamp = toDateObj.getTime();
		}

		const dates: any = { fromDate: fromDateTimestamp, toDate: toDateTimestamp };
		this.datesEvent.emit(dates);
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate) ||
			(this.toDate && date.equals(this.toDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}

	clearDates()
	{
		this.fromDate = null;
		this.toDate = null;
		this.datesEvent.emit({ fromDate: null, toDate: null });
	}

	private convertTimestampToNgbDate(timestamp: number): NgbDate {
		const date = new Date(Number(timestamp));		
		return new NgbDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
	}
}
