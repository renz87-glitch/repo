using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using NSwag.AspNetCore;
using System;
using System.IO;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Configura i servizi (ad es. controller, file statici, ecc.)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// Configura NSwag utilizzando le impostazioni lette da appsettings.json
builder.Services.AddOpenApiDocument();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Se vuoi utilizzare le impostazioni lette da appsettings.json:
    app.UseOpenApi();
    app.UseSwaggerUi();
}

// Middleware per il fallback alle SPA (come nel tuo snippet)
app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    await next();

    if (context.Response.StatusCode == 404 &&
        !Path.HasExtension(context.Request.Path.Value) &&
        !context.Request.Path.Value.StartsWith("/api/") &&
        !context.Request.Path.Value.StartsWith("/swagger") &&
        !context.Request.Path.Value.StartsWith("/openapi"))
    {
        Console.WriteLine("dirotto verso index!");
        context.Request.Path = "/index.html";
        await next();
    }
});

// Abilita i file statici (assicurati di aver configurato wwwroot e index.html)
app.UseStaticFiles();

// Mappa i controller (se ne hai)
app.MapControllers();

// Avvia l'host web in background
Task webHostTask = app.RunAsync();

// Esegui la logica CLI in un task separato
Task cliTask = Task.Run(() =>
{
    // Logica CLI: per esempio, leggere comandi da console o eseguire operazioni CLI
    Console.WriteLine("Applicazione CLI in esecuzione. Digita 'exit' per terminare.");
    while (true)
    {
        string? input = Console.ReadLine();
        if (input?.Trim().ToLower() == "exit")
        {
            Console.WriteLine("Terminazione CLI richiesta.");
            break;
        }
        // Puoi gestire altri comandi qui...
        Console.WriteLine($"Hai digitato: {input}");
    }
});

// Attendi la terminazione di uno dei due (ad es. se l'utente esce dalla CLI)
await Task.WhenAny(webHostTask, cliTask);
