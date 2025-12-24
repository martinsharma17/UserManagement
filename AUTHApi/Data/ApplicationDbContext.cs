using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using AUTHApi.Entities;
namespace AUTHApi.Data
{
    public class ApplicationDbContext :IdentityDbContext<ApplicationUser>
    {
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<KycForm> KycForms { get; set; }
        public DbSet<KycPersonalInfo> KycPersonalInfos { get; set; }
        public DbSet<KycAddress> KycAddresses { get; set; }
        public DbSet<KycFamily> KycFamilies { get; set; }
        public DbSet<KycBank> KycBanks { get; set; }
        public DbSet<KycOccupation> KycOccupations { get; set; }
        public DbSet<KycGuardian> KycGuardians { get; set; }
        public DbSet<KycLegal> KycLegals { get; set; }
        public DbSet<KycInvestment> KycInvestments { get; set; }
        public DbSet<KycAttachment> KycAttachments { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure 1:1 relationships between KycForm and its sections
            builder.Entity<KycForm>()
                .HasOne(f => f.PersonalInfo)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycPersonalInfo>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Address)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycAddress>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Family)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycFamily>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Bank)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycBank>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Occupation)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycOccupation>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Guardian)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycGuardian>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Legal)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycLegal>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<KycForm>()
                .HasOne(f => f.Investment)
                .WithOne(s => s.KycForm)
                .HasForeignKey<KycInvestment>(s => s.KycFormId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
