export class SpecialEvent<T> {
   message: string
   value?: T
   constructor(message: string, value?: T) {
      this.message = message
      this.value = value
   }
}

export class EventValue<T, S> {
   value: T
   event: SpecialEvent<S>
   constructor(value: T, event: SpecialEvent<S>) {
      this.value = value
      this.event = event
   }
}
