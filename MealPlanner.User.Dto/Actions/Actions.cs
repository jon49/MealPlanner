namespace MealPlanner.User.Dto.Actions
{
    public record LoginUser
        ( string Email,
          string EncryptedPassword );

    public record RegisterUser
        ( string Email,
          string EncryptedPassword,
          string FirstName,
          string LastName );

    public record LoggedInUser
        ( string SessionId
        , long UserId );

    public record GetSession ( string Session );

    public record AddBetaUser ( string Email );
    public static class BetaUsers
    {
        public static readonly GetBetaUsers Get = new();
        public record GetBetaUsers();
    }

}
