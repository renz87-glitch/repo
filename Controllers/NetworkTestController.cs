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
        [AllowAnonymous]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadTest()
        {
            // Lettura a stream della richiesta per evitare allocazioni in memoria di grandi dimensioni
            var buffer = new byte[64 * 1024]; // 64KB
            long total = 0;
            var sw = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                int read;
                while ((read = await Request.Body.ReadAsync(buffer, 0, buffer.Length, HttpContext.RequestAborted)) > 0)
                {
                    total += read;
                }
                sw.Stop();
                var durationMs = sw.Elapsed.TotalMilliseconds;
                var mbps = durationMs > 0 ? (total * 8.0) / (durationMs / 1000.0) / (1024 * 1024) : 0;
                return Ok(new { message = "Upload completato", sizeReceived = total, durationMs, mbps });
            }
            catch (OperationCanceledException)
            {
                sw.Stop();
                return BadRequest(new { message = "Upload cancellato" });
            }
            catch (Exception ex)
            {
                sw.Stop();
                return BadRequest(new { message = "Errore durante l'upload", error = ex.Message });
            }
        }

        /// <summary>
        /// Restituisce informazioni sul client che effettua la richiesta (IP, X-Forwarded-For, User-Agent).
        /// </summary>
        [HttpGet("client")]
        [AllowAnonymous]
        public IActionResult ClientInfo()
        {
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var xff = Request.Headers.ContainsKey("X-Forwarded-For") ? Request.Headers["X-Forwarded-For"].ToString() : string.Empty;
            var ua = Request.Headers["User-Agent"].ToString();
            return Ok(new { ip = remoteIp, xForwardedFor = xff, userAgent = ua });
        }

        /// <summary>
        /// Stream chunked di dati casuali per misurare download in tempo reale.
        /// Parametri:
        /// - durationSec (preferito): durata del test in secondi. Se > 0, ignora sizeMB.
        /// - sizeMB (fallback): dimensione totale da inviare se durationSec <= 0.
        /// - chunkKB: dimensione del chunk.
        /// - delayMs: eventuale delay tra chunk.
        /// </summary>
        [HttpGet("stream")]
        [AllowAnonymous]
        public async Task<IActionResult> Stream([FromQuery] int durationSec = 0, [FromQuery] int sizeMB = 50, [FromQuery] int chunkKB = 256, [FromQuery] int delayMs = 0)
        {
            if (durationSec < 0) durationSec = 0;
            if (sizeMB <= 0) sizeMB = 1;
            if (chunkKB <= 0) chunkKB = 64;
            Response.ContentType = "application/octet-stream";
            Response.Headers["Cache-Control"] = "no-cache";

            var totalBytes = (long)sizeMB * 1024L * 1024L; // usato solo se durationSec == 0
            var buffer = new byte[chunkKB * 1024];
            var rng = new Random();
            long sent = 0;
            var sw = System.Diagnostics.Stopwatch.StartNew();
            while (sent < totalBytes && !HttpContext.RequestAborted.IsCancellationRequested)
            {
                rng.NextBytes(buffer);
                var toSend = (int)Math.Min(buffer.Length, totalBytes - sent);
                await Response.Body.WriteAsync(buffer, 0, toSend, HttpContext.RequestAborted);
                await Response.Body.FlushAsync(HttpContext.RequestAborted);
                sent += toSend;
                if (delayMs > 0)
                {
                    await Task.Delay(delayMs, HttpContext.RequestAborted);
                }

                if (durationSec > 0 && sw.Elapsed.TotalSeconds >= durationSec)
                {
                    break;
                }

                // Se stiamo usando durata, amplia artificialmente totalBytes per continuare a ciclare fino al tempo
                if (durationSec > 0 && sent >= totalBytes)
                {
                    totalBytes += buffer.Length; // evita terminazione per dimensione
                }
            }
            return new EmptyResult();
        }
    }
}
