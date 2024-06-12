
interface TimeIntervalDto {
    start: string;
    end: string;
  }


export class AvailabilitySchedule{
    availableDays: string[];
    availableHours: TimeIntervalDto[];
    eventDuration: number;
}