import { DBSchema, IDBPObjectStore, IDBPTransaction, IDBPDatabase } from "idb"
import { openDB as OPEND_DB } from "idb/build/esm/entry"

type PickClassFactory<T extends {[K: string]: new (...args: any) => any}, S extends keyof T> = { [K in S]: InstanceType<T[K]> }
declare namespace DB.Internal {
    /*** READ ONLY ***/
    class SettingsRead {
        constructor(db: IDBPDatabase<MealPlanner>)
        get<T extends DatabaseType.SettingsData, K extends SettingsKey>(id: K) : Promise<T[K] | undefined>
        getAll(): Promise<(string | DatabaseType.MealPlannerSettings | undefined)[]>
    }

    class RecipeRead {
        constructor(db: IDBPDatabase<MealPlanner>)
        get(id: number): Promise<DatabaseType.RecipeData | undefined>
        getAll(): Promise<DatabaseType.RecipeData[]>
    }

    class MealTimeRead {
        constructor(db: IDBPDatabase<MealPlanner>)
        get(id: number): Promise<DatabaseType.MealTimeData | undefined>
        getAll(): Promise<DatabaseType.MealTimeData[]>
    }

    class RecipeDateRead {
        constructor(db: IDBPDatabase<MealPlanner>)
        getRange(start: string, end: string, mealTimeId: number): Promise<DatabaseType.RecipeDateData[]>
    }

    class ChangeLogRead {
        constructor(db: IDBPDatabase<MealPlanner>)
        getAll(): Promise<DatabaseType.ChangeLog[]>
    }

    /*** STORES ***/

    class RecipeStore {
        constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore)
        get(id: number): Promise<DatabaseType.RecipeData | undefined>
        getAll(): Promise<DatabaseType.RecipeData[]>
        put(o: DatabaseType.RecipeData): Promise<number>
    }

    class MealTimeStore {
        constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore)
        get(id: number): Promise<DatabaseType.MealTimeData | undefined>
        put(o: DatabaseType.MealTimeData): Promise<number>
    }

    class RecipeDateStore {
        constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore)
        get(id: number): Promise<string | DatabaseType.MealPlannerSettings | undefined>
        getAll(range: IDBKeyRange): Promise<DatabaseType.RecipeDateData[]>
        put(o: DatabaseType.RecipeDateData): Promise<number>
    }

    class SettingsStore {
        constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore)
        get(id: SettingsKey): Promise<string | DatabaseType.MealPlannerSettings | undefined>
        put(o: Partial<DatabaseType.SettingsData>): Promise<void>
        delete(key: SettingsKey): Promise<void>
    }
}

export interface DatabaseWindow extends Window {
   DB: {
      getDB<T extends MealPlannerTable>(tables: T[]): Promise<PickClassFactory<{
         recipe: typeof DB.Internal.RecipeStore;
         "meal-time": typeof DB.Internal.MealTimeStore;
         "recipe-date": typeof DB.Internal.RecipeDateStore;
         settings: typeof DB.Internal.SettingsStore;
      }, T> & { done: Promise<void> }>
      getReadOnlyDB<T extends AllTableNames>(tables: T[]) : Promise<PickClassFactory<{
         recipe: typeof DB.Internal.RecipeRead
         "meal-time": typeof DB.Internal.MealTimeRead
         "recipe-date": typeof DB.Internal.RecipeDateRead
         settings: typeof DB.Internal.SettingsRead
         "change-log": typeof DB.Internal.ChangeLogRead
      }, T> & { done: Promise<void> }>
      getRawDB(): Promise<IDBPDatabase<MealPlanner>>
   }
}

export namespace DatabaseType {
   type LocationKinds = "book" | "url" | "other"
   interface LocationKind<T extends LocationKinds> { _kind: T }
   interface LocationBook extends LocationKind<"book"> {  book: string, page: number } 
   interface LocationUrl extends LocationKind<"url"> { title: string, url: string }
   interface LocationOther extends LocationKind<"other"> { other: string }
   export type Location = LocationBook | LocationUrl | LocationOther

   /** E.g., Dinner, Lunch, etc */
   export interface MealTimeData {
      // int
      id: number
      /** name of meal time */
      name: string 
   }

   export interface RecipeDateData {
      date: string
      mealTimeId: number
      recipeId: number
      /** Number of meals */
      quantity: number
   }

   export interface RecipeData {
      id: number
      name: string
      location: Location
      categories: number[]
   }

   export interface MealPlannerSettings {
      /** ISODate E.g., 2020-02-20 */
      startDate: string
   }
   export interface SettingsData {
      mealPlanner: MealPlannerSettings
      theme?: string
   }

   export interface ChangeLog {
      tableName: keyof MealPlanner_
      recordId: (string|number)[]
      deleted?: boolean
   }
}

interface MealTimeSchema { key: number; value: DatabaseType.MealTimeData }
interface RecipeDateSchema { key: number; value: DatabaseType.RecipeDateData }
interface RecipeSchema { key: number; value: DatabaseType.RecipeData }
type SettingsKey = keyof DatabaseType.SettingsData
interface SettingsSchema { key: SettingsKey; value: DatabaseType.SettingsData[SettingsKey]  }
interface ChangeLogSchema { key: number, value: DatabaseType.ChangeLog }

export interface MealPlanner_ {
   recipe: RecipeSchema
   "meal-time": MealTimeSchema
   "recipe-date": RecipeDateSchema
   settings: SettingsSchema
}
interface MealPlanner__ extends MealPlanner_ {
   "change-log": ChangeLogSchema
}
export interface MealPlanner extends DBSchema, MealPlanner__ {
}
type MealPlannerTable = keyof MealPlanner_
type AllTableNames = keyof MealPlanner__
type MealPlannerTransaction = IDBPTransaction<MealPlanner, AllTableNames[]>
type ChangeLogObjectStore = IDBPObjectStore<MealPlanner, AllTableNames[], "change-log">


;(function() {
   // @ts-ignore
   var idb=function(e){"use strict";let t,n;const r=new WeakMap,o=new WeakMap,s=new WeakMap,a=new WeakMap,i=new WeakMap;let c={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return o.get(e);if("objectStoreNames"===t)return e.objectStoreNames||s.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return p(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function u(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(n||(n=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(f(this),t),p(r.get(this))}:function(...t){return p(e.apply(f(this),t))}:function(t,...n){const r=e.call(f(this),t,...n);return s.set(r,t.sort?t.sort():[t]),p(r)}}function d(e){return"function"==typeof e?u(e):(e instanceof IDBTransaction&&function(e){if(o.has(e))return;const t=new Promise((t,n)=>{const r=()=>{e.removeEventListener("complete",o),e.removeEventListener("error",s),e.removeEventListener("abort",s)},o=()=>{t(),r()},s=()=>{n(e.error||new DOMException("AbortError","AbortError")),r()};e.addEventListener("complete",o),e.addEventListener("error",s),e.addEventListener("abort",s)});o.set(e,t)}(e),n=e,(t||(t=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some(e=>n instanceof e)?new Proxy(e,c):e);var n}function p(e){if(e instanceof IDBRequest)return function(e){const t=new Promise((t,n)=>{const r=()=>{e.removeEventListener("success",o),e.removeEventListener("error",s)},o=()=>{t(p(e.result)),r()},s=()=>{n(e.error),r()};e.addEventListener("success",o),e.addEventListener("error",s)});return t.then(t=>{t instanceof IDBCursor&&r.set(t,e)}).catch(()=>{}),i.set(t,e),t}(e);if(a.has(e))return a.get(e);const t=d(e);return t!==e&&(a.set(e,t),i.set(t,e)),t}const f=e=>i.get(e);const l=["get","getKey","getAll","getAllKeys","count"],D=["put","add","delete","clear"],v=new Map;function b(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(v.get(t))return v.get(t);const n=t.replace(/FromIndex$/,""),r=t!==n,o=D.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!o&&!l.includes(n))return;const s=async function(e,...t){const s=this.transaction(e,o?"readwrite":"readonly");let a=s.store;r&&(a=a.index(t.shift()));const i=await a[n](...t);return o&&await s.done,i};return v.set(t,s),s}return c=(e=>({...e,get:(t,n,r)=>b(t,n)||e.get(t,n,r),has:(t,n)=>!!b(t,n)||e.has(t,n)}))(c),e.deleteDB=function(e,{blocked:t}={}){const n=indexedDB.deleteDatabase(e);return t&&n.addEventListener("blocked",()=>t()),p(n).then(()=>{})},e.openDB=function(e,t,{blocked:n,upgrade:r,blocking:o,terminated:s}={}){const a=indexedDB.open(e,t),i=p(a);return r&&a.addEventListener("upgradeneeded",e=>{r(p(a.result),e.oldVersion,e.newVersion,p(a.transaction))}),n&&a.addEventListener("blocked",()=>n()),i.then(e=>{s&&e.addEventListener("close",()=>s()),o&&e.addEventListener("versionchange",()=>o())}).catch(()=>{}),i},e.unwrap=f,e.wrap=p,e}({});
   const openDB : typeof OPEND_DB = (<any>idb).openDB


   class RecipeStore {
      private changeLog: ChangeLogObjectStore
      private recipeStore: IDBPObjectStore<MealPlanner, AllTableNames[], "recipe">
      constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
         this.changeLog = changeLog
         this.recipeStore = tx.objectStore("recipe")
      }
      async get(id: number) { return await this.recipeStore.get(id) }
      async getAll() { return await this.recipeStore.getAll() }
      async put(o: DatabaseType.RecipeData) {
         await this.changeLog.put({tableName: "recipe", recordId: [o.id]})
         return await this.recipeStore.put(o)
      }
   }

   class MealTimeStore {
      private changeLog: ChangeLogObjectStore
      private store: IDBPObjectStore<MealPlanner, AllTableNames[], "meal-time">
      constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
         this.changeLog = changeLog
         this.store = tx.objectStore("meal-time")
      }
      async get(id: number) { return await this.store.get(id) }
      async put(o: DatabaseType.MealTimeData) {
         await this.changeLog.put({tableName: "meal-time", recordId: [o.id]})
         return await this.store.put(o)
      }
   }

   class RecipeDateStore {
      private changeLog: ChangeLogObjectStore
      private recipeDateStore: IDBPObjectStore<MealPlanner, AllTableNames[], "recipe-date">
      constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
         this.changeLog = changeLog
         this.recipeDateStore = tx.objectStore("recipe-date")
      }
      async get(id: number) { return await this.recipeDateStore.get(id) }
      async getAll(range: IDBKeyRange) { return await this.recipeDateStore.getAll(range) }
      async put(o: DatabaseType.RecipeDateData) {
         await this.changeLog.put({tableName: "recipe-date", recordId: [o.date, o.mealTimeId]})
         return await this.recipeDateStore.put(o)
      }
   }

   class SettingsStore {
      private changeLog: ChangeLogObjectStore
      private store: IDBPObjectStore<MealPlanner, AllTableNames[], "settings">
      constructor(tx: MealPlannerTransaction, changeLog: ChangeLogObjectStore) {
         this.changeLog = changeLog
         this.store = tx.objectStore("settings")
      }
      async get(id: SettingsKey) { return await this.store.get(id) }
      async put(o: Partial<DatabaseType.SettingsData>) {
         for (const key of Object.keys(o)) {
            const value = o[<SettingsKey>key]
            if (value) {
               await this.store.put(value, <SettingsKey>key)
               await this.changeLog.put({tableName: "settings", recordId: [key]})
            }
         }
      }
      async delete(key: SettingsKey) {
         await this.store.delete(key)
         await this.changeLog.put({ tableName: "settings", recordId: [key] })
      }
   }

   async function getDB<T extends MealPlannerTable>(tables: T[]) {
      const db = await getRawDB()
      const tableWithChangeLog = (<AllTableNames[]>tables).concat("change-log")
      const tx = db.transaction(tableWithChangeLog, "readwrite")
      const changeLog = tx.objectStore("change-log")
      const update = {
         recipe: RecipeStore,
         "meal-time": MealTimeStore,
         "recipe-date": RecipeDateStore,
         settings: SettingsStore
      }
      const result : PickClassFactory<typeof update, T> = tables.reduce((acc, value) => {
         acc[value] = new update[value](tx, changeLog)
         return acc
      }, <any>{})
      return { ...result, get done() { return tx.done } }
   }

   class RecipeRead {
      db: IDBPDatabase<MealPlanner>
      constructor(db: IDBPDatabase<MealPlanner>) {
         this.db = db
      }
      get(id: number) { return this.db.get("recipe", id) }
      getAll() { return this.db.getAll("recipe") }
   }

   class MealTimeRead {
      db: IDBPDatabase<MealPlanner>
      constructor(db: IDBPDatabase<MealPlanner>) {
         this.db = db
      }
      get(id: number) { return this.db.get("meal-time", id) }
      getAll() { return this.db.getAll("meal-time") }
   }

   class RecipeDateRead {
      db: IDBPDatabase<MealPlanner>
      constructor(db: IDBPDatabase<MealPlanner>) {
         this.db = db
      }
      getRange(start: string, end: string, mealTimeId: number) { return this.db.getAll("recipe-date", IDBKeyRange.bound([start, mealTimeId], [end, mealTimeId])) }
   }

   class SettingsRead {
      db: IDBPDatabase<MealPlanner>
      constructor(db: IDBPDatabase<MealPlanner>) {
         this.db = db
      }
      get<T extends DatabaseType.SettingsData, K extends SettingsKey>(id: K) : Promise<T[K] | undefined> {
         return <Promise<any>>this.db.get("settings", id)
      }
      getAll() { return this.db.getAll("settings") }
   }

   class ChangeLogRead {
      db: IDBPDatabase<MealPlanner>
      constructor(db: IDBPDatabase<MealPlanner>) {
         this.db = db
      }
      getAll() { return this.db.getAll("change-log") }
   }

   async function getReadOnlyDB<T extends AllTableNames>(tables: T[]) {
      const db = await getRawDB()
      const readOnly = {
         recipe: RecipeRead,
         "meal-time": MealTimeRead,
         "recipe-date": RecipeDateRead,
         settings: SettingsRead,
         "change-log": ChangeLogRead,
      }
      const result : PickClassFactory<typeof readOnly, T> = tables.reduce((acc, value) => {
         acc[value] = new readOnly[value](db)
         return acc
      }, <any>{})
      return result
   }

   async function getRawDB() {
      return (<typeof OPEND_DB>openDB)<MealPlanner>("meal-planner", 18, {
         async upgrade(db, _, __, tx) {
            var stores = db.objectStoreNames
            if (!stores.contains("meal-time")) {
               db.createObjectStore("meal-time", { keyPath: "id" })
               await tx.objectStore("meal-time").put({ id: 1, name: "Dinner" })
            }

            if (!stores.contains("settings")) {
               db.createObjectStore("settings")
               const d = new Date()
               const startDate = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
               await tx.objectStore("settings")
               .put({ startDate }, "mealPlanner")
            }

            if (!stores.contains("recipe-date")) {
               db.createObjectStore("recipe-date", { keyPath: ["date", "mealTimeId"] })
            }

            if (!stores.contains("recipe")) {
               db.createObjectStore("recipe", { keyPath: "id" })
            }

            if (!stores.contains("change-log")) {
               db.createObjectStore("change-log", { keyPath: ["tableName", "recordId"] })
            }

         }
      })
   }

   // @ts-ignore
   self.DB = {
      getDB,
      getReadOnlyDB,
      getRawDB: getRawDB
   }

}());
