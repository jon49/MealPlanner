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
}
