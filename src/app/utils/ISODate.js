// @ts-check

export default class ISODate {
   /**
    * @param {string|Date} d 
    */
   constructor(d) {
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

   /**
    * @param {number} numberOfDays 
    */
   addDays(numberOfDays) {
      return new ISODate(new Date(this.year, this.month - 1, this.date + numberOfDays))
   }

   toString() {
      return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.date.toString().padStart(2, "0")}`
   }

   /**
    * 
    * @param {ISODate} d 
    */
   equals(d) {
      return this.year === d.year && this.month === d.month && this.date === d.date
   }
}
