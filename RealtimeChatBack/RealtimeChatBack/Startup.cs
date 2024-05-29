using System.Collections.Generic; 
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RealtimeChatBack.EFModels;
using RealtimeChatBack.HubConfig;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;
using RealtimeChatBack.Hubs;
using RealtimeChatBack;

namespace RealtimeChatBack
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        // Konstruktor klase Startup, koristi se za konfigurisanje aplikacije
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // Konfiguriše servise koje će aplikacija koristiti
        public void ConfigureServices(IServiceCollection services)
        {
            // Dodaje DbContextPool za SignalrContext, konfiguriše ga da koristi SQL Server bazu podataka
            services.AddDbContextPool<SignalrContext>(
                options => options.UseSqlServer(Configuration.GetConnectionString("MyConnection"))
            );

            // Konfiguriše CORS politiku za dozvoljene originale
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:4200")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    });
            });

            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
            });

            services.AddControllers();

            // Dodaje Swagger za generisanje dokumentacije API-ja
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
            });

            // Dodaje singleton rečnik za čuvanje veza korisnika i soba
            services.AddSingleton<IDictionary<string, UserRoomConnection>>(opt => new Dictionary<string, UserRoomConnection>());
        }

        // Konfiguriše aplikaciju i middleware
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Proverava da li je aplikacija u development modu
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                });
            }

            // Omogućava rutiranje
            app.UseRouting();

            // Omogućava CORS politiku
            app.UseCors("AllowSpecificOrigin");

            // Omogućava krajnje tačke za kontrolere i Hub-ove
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<MyHub>("/toastr");
                endpoints.MapHub<ChatHub>("/chat");
            });
        }
    }
}
