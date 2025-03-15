using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;


namespace ApiRepo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NetworkTestController : ControllerBase
    {
        /// <summary>
        /// Endpoint per il test di download.
        /// Restituisce un file di dimensioni note (ad esempio, 10 MB).
        /// </summary>
        [HttpGet("download")]
        public IActionResult DownloadTest()
        {
            // Dimensione del file in byte (ad esempio, 10 MB)
            int sizeInBytes = 10 * 1024 * 1024;
            byte[] data = new byte[sizeInBytes];

            // Riempie l'array con dati casuali
            new Random().NextBytes(data);

            // Restituisce il file con content type "application/octet-stream"
            return File(data, "application/octet-stream", "testfile.dat");
        }

        /// <summary>
        /// Endpoint per il test di upload.
        /// Accetta dati tramite POST e restituisce la dimensione dei byte ricevuti.
        /// </summary>
        [HttpPost("upload")]
        public async Task<IActionResult> UploadTest()
        {
            // Legge il contenuto della richiesta in un MemoryStream
            using var ms = new MemoryStream();
            try
            {
                await Request.Body.CopyToAsync(ms);
                long sizeReceived = ms.Length;

                // Restituisce la dimensione ricevuta come conferma
                return Ok(new { message = "Upload completato", sizeReceived });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "File troppo grosso", Request.Body.Length });
            }
        }
    }
}
