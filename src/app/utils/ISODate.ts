export default class ISODate {
   year : number
   month: number
   date: number
   constructor(d: string | Date) {
      if (typeof d === "string") {
         this.year = +d.slice(0, 4)
         this.month = +d.slice(5, 7)
         this.date = +d.slice(8, 10)
      } else {
         this.year = d.getFullYear()
         this.month = d.getMonth() + 1
         this.date = d.getDate()
      }
   }

   getDate() {
      return new Date(this.year, this.month - 1, this.date)
   }

   addDays(numberOfDays: number) {
      return new ISODate(new Date(this.year, this.month - 1, this.date + numberOfDays))
   }

   toString() {
      return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.date.toString().padStart(2, "0")}`
   }

   equals(d: ISODate) {
      return this.year === d.year && this.month === d.month && this.date === d.date
   }
}
