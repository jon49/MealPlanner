export class SpecialEvent<T> {
   message: string
   value?: T
   constructor(message: string, value?: T) {
      this.message = message
      this.value = value
   }
}

export class ErrorWithUserMessage {
   userMessage: string
   error: any
   constructor(userMessage: string, error: any) {
      this.userMessage = userMessage
      this.error = error
   }
}

export const FriendlyError =
   (userMessage: string) =>
   (error: any) =>
   new ErrorWithUserMessage(userMessage, error)

export class EventValue<T, S> {
   value: T
   event: SpecialEvent<S>
   constructor(value: T, event: SpecialEvent<S>) {
      this.value = value
      this.event = event
   }
}
