

export class Task {
    name: string;
    taskFn: Function;
    beforeTaskFn?: Function;
    afterTaskFn?: Function;
}