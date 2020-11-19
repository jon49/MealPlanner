import { DatabaseWindow } from "../utils/database";
import { Load } from "../sw"
import { AddFormEvent } from "../index"

export interface HtmlRunner {
    start: (callback: Function) => Promise<void>
}
export type HTMLRunnerSubs = string | string[] | Promise | Promise[] | HtmlRunner | HtmlRunner[]
export type HTML =
    (literals: TemplateStringsArray, ...substs: HTMLRunnerSubs[]) => HtmlRunner
export interface DB extends DatabaseWindow {}

interface ModuleMethod {
    render: () => { start: (callback: Function) => string }
    command: any
    [key:string]: any
}
export type Module = Promise<ModuleMethod>

global {
    declare const load: Load
    declare const addFormEvent : AddFormEvent
}
