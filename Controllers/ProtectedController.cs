using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiRepo.Controllers
{
        [ApiController]
        [Route("api/[controller]")]
        public class ProtectedController : ControllerBase
        {
            // Questo endpoint richiede autenticazione
            [HttpGet]
            [Authorize]
            public IActionResult GetSecretData()
            {
                return Ok(new { message = "Dati protetti accessibili solo con un token valido" });
            }

            // Questo endpoint richiede autenticazione Admin
            [HttpGet("admin")]
            [Authorize(Roles = "Admin")]
            public IActionResult GetSecretDataAdmin()
            {
                return Ok(new { message = "Dati protetti accessibili solo per ADMIN" });
            }

             // Questo endpoint richiede autenticazione Admin
             [HttpGet("manager")]
             [Authorize(Roles = "Admin,Manager")]
             public IActionResult GetSecretDataManager()
             {
                 return Ok(new { message = "Dati protetti accessibili solo per MANAGER o superiori" });
             }
    }
}
