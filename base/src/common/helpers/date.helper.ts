export function getDate(dateFilter: string, range?: any) {
  const currentDate = new Date();

  if (dateFilter === 'this_month') {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    return {
      current: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      },
      previous: {
        start: startOfPrevMonth.toISOString(),
        end: endOfPrevMonth.toISOString()
      }
    };
  }

  else if (dateFilter === 'this_quarter') {
    const currentMonth = currentDate.getMonth();
    const startOfQuarterMonth = currentMonth - (currentMonth % 3);
    const startOfQuarter = new Date(currentDate.getFullYear(), startOfQuarterMonth, 1);
    const endOfQuarter = new Date(currentDate.getFullYear(), startOfQuarterMonth + 3, 0);

    const startOfPrevQuarterMonth = startOfQuarterMonth - 3;
    const startOfPrevQuarter = new Date(currentDate.getFullYear(), startOfPrevQuarterMonth, 1);
    const endOfPrevQuarter = new Date(currentDate.getFullYear(), startOfPrevQuarterMonth + 3, 0);

    return {
      current: {
        start: startOfQuarter.toISOString(),
        end: endOfQuarter.toISOString()
      },
      previous: {
        start: startOfPrevQuarter.toISOString(),
        end: endOfPrevQuarter.toISOString()
      }
    };
  }

  else if (dateFilter === 'this_year') {
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);

    const startOfPrevYear = new Date(currentDate.getFullYear() - 1, 0, 1);
    const endOfPrevYear = new Date(currentDate.getFullYear() - 1, 11, 31);

    return {
      current: {
        start: startOfYear.toISOString(),
        end: endOfYear.toISOString()
      },
      previous: {
        start: startOfPrevYear.toISOString(),
        end: endOfPrevYear.toISOString()
      }
    };
  }

  else if (dateFilter === 'between') {
    if (range && range.start && range.end) {
      const start = new Date(range.start).toISOString();
      const end = new Date(range.end).toISOString();
      return {
        current: {
          start: start,
          end: end
        }
      };
    } else {
      throw new Error("Range must include start and end dates for 'between' filter");
    }
  }

  else {
    throw new Error("Invalid date filter");
  }
}
