using ApiRepo.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(); // Questo abilita i controller
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers(); // Questo assicura che vengano registrati

// Debug: stampa i controller registrati
Console.WriteLine("Controllers registrati:");
foreach (var controller in builder.Services)
{
    if (controller.ServiceType.FullName?.Contains("Controller") == true)
    {
        Console.WriteLine(controller.ServiceType.FullName);
    }
}

app.Run();

