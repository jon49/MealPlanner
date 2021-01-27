namespace MealPlanner.User.Databases
{
    public static class Table
    {
        public static class User
        {
            public const string Table = "Users";

            public const string Id = "Id";
            public const string _Id = "$Id";

            public const string Email = "email";
            public const string _Email = "$Email";

            public const string Password = "Password";
            public const string _Password = "$Password";

            public const string FirstName = "FirstName";
            public const string _FirstName = "$FirstName";

            public const string LastName = "LastName";
            public const string _LastName = "$LastName";
        }

        public static class Session
        {
            public const string Table = "Session";

            public const string Id = "Id";
            public const string _Id = "$Id";

            public const string Expiration = "Expiration";
            public const string _Expiration = "$Expiration";

            public const string UserId = "UserId";
            public const string _UserId = "$UserId";

            public const string Deleted = "Deleted";
            public const string _Deleted = "$Deleted";
        }
    }
}
