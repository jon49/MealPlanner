using System;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace ServerApp.Utils
{
    public static class SecurePasswordHasher
    {
        /// <summary>
        /// Creates a hash from a password with 10000 iterations
        /// </summary>
        /// <param name="password">The password.</param>
        /// <returns>The hash.</returns>
        public static string Hash(string password, byte[] salt)
            => Convert.ToBase64String(KeyDerivation.Pbkdf2
                ( password: password,
                  salt: salt,
                  prf: KeyDerivationPrf.HMACSHA1,
                  iterationCount: 10_000,
                  numBytesRequested: 256 / 8) );

        /// <summary>
        /// Verifies a password against a hash.
        /// </summary>
        /// <param name="password">The password.</param>
        /// <param name="hashedPassword">The hash.</param>
        /// <returns>Could be verified?</returns>
        public static bool Verify(string password, string hashedPassword, byte[] salt)
            => Hash(password, salt) == hashedPassword;
    }
}
