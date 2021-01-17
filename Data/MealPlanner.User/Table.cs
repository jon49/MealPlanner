namespace MealPlanner.User
{
    public static class Table
    {
        public static class User
        {
            public const string Table = "users";
            public const string Id = "id";
            public const string Email = "email";
            public const string Password = "password";
            public const string FirstName = "first_name";
            public const string LastName = "last_name";
        }

        public static class Session
        {
            public const string Table = "session";
            public const string Id = "id";
            public const string Expiration = "expiration";
            public const string UserId = "user_id";
            public const string Deleted = "deleted";
        }
    }
}
