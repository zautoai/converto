interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function toUpperCase(value: string): string {
  return value.toUpperCase();
}

export function toString(value: string): string {
  return value.toString();
}

export function trim(value: string): string {
  return value.trim();
}

export function toDate(value: string): Date {
  return new Date(value);
}

export function toDateFromTimestamp(value: string): Date {
  return new Date(Number(value));
}

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();
  return value === 'true' || value === '1';
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default !== undefined ? opts.default : NaN;
  }

  if (opts.min !== undefined && newValue < opts.min) {
    newValue = opts.min;
  }

  if (opts.max !== undefined && newValue > opts.max) {
    newValue = opts.max;
  }

  return newValue;
}

export function transformNameToKey(name: string): string {
  return name.toLocaleLowerCase().replaceAll(/\s+/g, '_');
}

export function getSchemaName(orgId: string): string {
  const tenantName = `org_${orgId}`;
  const sanitizedSchemaName = tenantName.replace(/[^a-zA-Z0-9_]/g, '_');
  return sanitizedSchemaName;
}

export function buildQueryString(params: { [key: string]: string }): string {
  return Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join('&');
}


export function convertToKey(name: string) {
  return name.toLowerCase().replaceAll(' ', '_');
}