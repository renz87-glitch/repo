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
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Ottimizza limiti Kestrel per test di rete (disabilita data rate minimi e aumenta dimensione body)
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MinRequestBodyDataRate = null;   // evita abort su upload lenti
    options.Limits.MinResponseDataRate = null;      // evita abort su stream download lenti
    options.Limits.MaxRequestBodySize = 1_073_741_824; // 1 GB
});

// Rimosso: lettura CorsPolicies da appsettings
// Modalità CORS: "Dynamic" | "Static" | (fallback automatico)
var corsMode = builder.Configuration["Cors:Mode"];
var staticPolicyName = builder.Configuration["Cors:StaticPolicyName"] ?? "StaticCustom";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var allowedMethods = builder.Configuration.GetSection("Cors:AllowedMethods").Get<string[]>() ?? new[] { "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS" };
var allowedHeaders = builder.Configuration.GetSection("Cors:AllowedHeaders").Get<string[]>() ?? new[] { "Content-Type", "Authorization", "Accept", "X-Requested-With" };

// Costruisci l'elenco degli host locali (IP/hostname) consentiti per CORS dinamico
HashSet<string> BuildLocalHosts()
{
    var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "localhost",
        "127.0.0.1",
        "::1"
    };
    try
    {
        foreach (var ni in NetworkInterface.GetAllNetworkInterfaces()
                     .Where(n => n.OperationalStatus == OperationalStatus.Up))
        {
            foreach (var ua in ni.GetIPProperties().UnicastAddresses)
            {
                var addr = ua.Address;
                if (addr.AddressFamily == AddressFamily.InterNetwork || addr.AddressFamily == AddressFamily.InterNetworkV6)
                {
                    set.Add(addr.ToString());
                }
            }
        }
        var hostName = Dns.GetHostName();
        set.Add(hostName);
        foreach (var addr in Dns.GetHostAddresses(hostName))
        {
            set.Add(addr.ToString());
        }
    }
    catch { }
    return set;
}
var localHosts = BuildLocalHosts();

// Configura CORS: qui viene creato un policy che consente tutte le origini, metodi e header
builder.Services.AddCors(options =>
{
    // Policy statica personalizzabile via appsettings (Cors:Allowed*)
    options.AddPolicy("StaticCustom", policy =>
    {
        var origins = (allowedOrigins.Length > 0) ? allowedOrigins : new[] { "http://localhost:3000" };
        policy.WithOrigins(origins)
              .WithMethods(allowedMethods)
              .WithHeaders(allowedHeaders);
    });

    // Policy dinamica basata sugli IP/host locali del server
    options.AddPolicy("DynamicIp", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
                var host = uri.Host;
                return localHosts.Contains(host);
            });
        // .AllowCredentials(); // abilita solo se usi cookie/credenziali cross-origin
    });
});

// Selezione policy da usare a runtime
string selectedCorsPolicyName = string.Equals(corsMode, "dynamic", StringComparison.OrdinalIgnoreCase)
    ? "DynamicIp"
    : (staticPolicyName ?? "StaticCustom");

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
    Console.WriteLine($"request arrived: {context.Request.Path}");
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

// Abilita CORS prima degli endpoint
app.UseCors(selectedCorsPolicyName);

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


// Rimosso: modello CorsPolicySettings (non più usato)
