using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using NSwag.AspNetCore;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// Leggi la sezione "CorsPolicies" da appsettings.json e mappala in un dizionario
var corsPolicies = builder.Configuration
    .GetSection("CorsPolicies")
    .Get<Dictionary<string, CorsPolicySettings>>();


// Configura CORS: qui viene creato un policy che consente tutte le origini, metodi e header
builder.Services.AddCors(options =>
{
    if(corsPolicies?.Count > 0) 
    {
        foreach (var policyConfig in corsPolicies)
        {
            options.AddPolicy(policyConfig.Key, policy =>
            {
                //"http://localhost:3000"
                policy.WithOrigins(policyConfig.Value.AllowedOrigins)
                      .WithMethods(policyConfig.Value.AllowedMethods)
                      .WithHeaders(policyConfig.Value.AllowedHeaders);
            });
        }
    } 
    else
    {
        // default
        options.AddPolicy("Policy1", policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://192.168.178.113:3000")
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    }
});

// Leggi le impostazioni JWT dal file di configurazione
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = jwtSettings["Key"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

// Genera una nuova chiave RSA ogni avvio (2048 bit)
RSA rsa = RSA.Create(2048);
// Registra la chiave RSA come singleton
builder.Services.AddSingleton(rsa);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Imposta a true in produzione
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        // Usa la chiave RSA generata
        IssuerSigningKey = new RsaSecurityKey(rsa)
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("OnAuthenticationFailed: Accesso negato per {Path} da utente {User}.",
                                context.HttpContext.Request.Path,
                                context.HttpContext.User.Identity?.Name ?? "anonymous");
            if(context.Exception != null)
            {
                logger.LogWarning("Exception: {Exception}.",
                                   context.Exception);
            }
            return Task.CompletedTask;
        },
        OnForbidden = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("OnForbidden: Accesso negato per {Path} da utente {User}.",
                                context.HttpContext.Request.Path,
                                context.HttpContext.User.Identity?.Name ?? "anonymous");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            if (context.Error == null)
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("OnChallenge: Challenge per {Path}, StatusCode: {StatusCode}.",
                                    context.HttpContext.Request.Path, context.Response.StatusCode);
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

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

if (corsPolicies?.Count > 0)
{
    app.UseCors(corsPolicies.First().Key);
}
else
{
    app.UseCors("Policy1");
}

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


public class CorsPolicySettings
{
    public string[] AllowedOrigins { get; set; }
    public string[] AllowedMethods { get; set; }
    public string[] AllowedHeaders { get; set; }
}