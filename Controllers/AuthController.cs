using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using ApiRepo.Models.Login;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ApiRepo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly RSA _rsa;

        public AuthController(IConfiguration configuration, RSA rsa)
        {
            _configuration = configuration;
            _rsa = rsa;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest login)
        {
            // Verifica delle credenziali. 
            // In produzione usa un meccanismo di validazione (es. database, Identity, ecc.)
            if (
                (login.Username == "admin" ||
                 login.Username == "user" ||
                 login.Username == "manager") &&
                login.Password == "password")
            {
                var token = GenerateJwtToken(login.Username);
                return Ok(new { token });
            }

            return Unauthorized(new { message = "Credenziali non valide" });
        }

        private string GenerateJwtToken(string username)
        {
            var signingKey = new RsaSecurityKey(_rsa);
            var tokenHandler = new JwtSecurityTokenHandler();

            // Aggiungi i claim per l'utente: includi il ruolo tramite ClaimTypes.Role
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),                
            };

            if(username == "admin")
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin")); // Ad esempio, il ruolo "Admin"
            }
            else if (username == "manager")
            {
                claims.Add(new Claim(ClaimTypes.Role, "Manager")); // Ad esempio, il ruolo "Manager"
            }
            else if (username == "user")
            {
                claims.Add(new Claim(ClaimTypes.Role, "User")); // Ad esempio, il ruolo "User"
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"] ?? "ilTuoIssuer",
                Audience = _configuration["Jwt:Audience"] ?? "ilTuoAudience",
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.RsaSha256)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}