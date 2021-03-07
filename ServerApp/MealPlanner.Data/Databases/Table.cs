namespace MealPlanner.Data.Databases
{
    public static class Table
    {
        public static class Events
        {
            public const string Table = nameof(Events);

            public const string Id = nameof(Id);
            public const string _Id = "$Id";

            public const string UserId = nameof(UserId);
            public const string _UserId = "$UserId";

            public const string Source = nameof(Source);
            public const string _Source = "$Source";

            public const string ItemType = nameof(ItemType);
            public const string _ItemType = "$ItemType";

            public const string ItemId = nameof(ItemId);
            public const string _ItemId = "$ItemId";

            public const string Value = nameof(Value);
            public const string _Value = "$Value";

            public const string Deleted = nameof(Deleted);
            public const string _Deleted = "$Deleted";
        }
    }
}
