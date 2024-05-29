// DbContext konfiguracija u sa entitetima Connections i Person
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

#nullable disable

namespace RealtimeChatBack.EFModels
{
    public partial class SignalrContext : DbContext
    {
        public SignalrContext(DbContextOptions<SignalrContext> options)
            : base(options)
        {
        }

        // DbSet za Connections entitet
        public virtual DbSet<Connections> Connections { get; set; }
        // DbSet za Person entitet
        public virtual DbSet<Person> Person { get; set; }

        // Konfigurisanje opcija za DbContext
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("server=(LocalDb)\\LocalDB; database=Signalr; Trusted_Connection=true");
            }
        }

        // Konfigurisanje modela entiteta
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("Relational:Collation", "SQL_Latin1_General_CP1_CI_AS");

            // Konfiguracija Connections entiteta
            modelBuilder.Entity<Connections>(entity =>
            {
                entity.ToTable("connections");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasDefaultValueSql("(newid())");

                entity.Property(e => e.PersonId).HasColumnName("personId");

                entity.Property(e => e.SignalrId)
                    .IsRequired()
                    .HasMaxLength(22)
                    .HasColumnName("signalrId");

                entity.Property(e => e.TimeStamp)
                    .HasColumnType("datetime")
                    .HasColumnName("timeStamp");
            });

            // Konfiguracija Person entiteta
            modelBuilder.Entity<Person>(entity =>
            {
                entity.ToTable("person");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasDefaultValueSql("(newid())");

                entity.Property(e => e.Password)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("password");

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasColumnName("username");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
