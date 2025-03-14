using Microsoft.AspNetCore.Mvc;

namespace ApiRepo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HelloController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Hello from .NET 9 API!" });
        }
    }
}