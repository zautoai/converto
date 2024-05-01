import { FormGroup } from "@angular/forms";

export function transformObjectToOptions(obj: any): any[] {
    const options = [];
    for (const entity in obj) {
        if (obj.hasOwnProperty(entity)) {
            for (const key in obj[entity]) {
                if (obj[entity].hasOwnProperty(key)) {
                    options.push({ label: obj[entity][key], groupBy: entity });
                }
            }
        }
    }
    return options;
}

export function isFieldValid(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName)!;
    return control.invalid && control.dirty;
}

export function isNotEmpty(...vars: any[]): boolean {
    for (const varItem of vars) {
        if (!varItem) {
            return false;
        }
    }
    return true;
}

export function isEmpty(...vars: any[]): boolean {
    for (const varItem of vars) {
        if (varItem) {
            return false;
        }
    }
    return true;
}

export function togglePassword(fieldId: string, iconVisibleClass: string, iconHiddenClass: string) {
    const input = document.getElementById(fieldId) as HTMLInputElement;
    const icon = document.querySelector(`.btn-password i`);
    if (input && icon) {
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.classList.toggle(iconVisibleClass);
        icon.classList.toggle(iconHiddenClass);
    }
}

export function updateDataList(response: any, dataList: any, newItem: any) {
    if (dataList.data) {
        const newData = response.data.filter((item: any) => !dataList.data.some((existingItem: any) => existingItem.id === item.id));
        dataList.data = dataList.data.concat(newData);
        if (newItem) {
            const index = dataList?.data.findIndex((item: any) => item.id === newItem?.id);
            if (index !== -1) {
                let [foundObject] = dataList.data.splice(index, 1); 
                dataList.data.unshift(foundObject);
            }
            newItem = null;
        }
        dataList.total = response.total;
        dataList.page = response.page;
    } else {
        dataList = response;
    }
    return dataList;
}

export function stringToArray(inputString:string, separator: string) {
    return inputString.split(separator);
}

export function isElementInArray(element:any[], array:any) {
    return array.includes(element);
}
