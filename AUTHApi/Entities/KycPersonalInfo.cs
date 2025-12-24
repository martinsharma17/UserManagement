using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    /// <summary>
    /// Section 1: Personal Information of the user.
    /// Linked 1:1 with the main KycForm.
    /// </summary>
    public class KycPersonalInfo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int KycFormId { get; set; }

        [ForeignKey("KycFormId")]
        public virtual KycForm? KycForm { get; set; }

        [Required]
        [MaxLength(255)]
        public string FullName { get; set; } = string.Empty;

        public DateTime? DobAd { get; set; }

        [MaxLength(20)]
        public string? DobBs { get; set; }

        [MaxLength(20)]
        public string? Gender { get; set; }

        [MaxLength(100)]
        public string? Nationality { get; set; }

        [MaxLength(50)]
        public string? CitizenshipNo { get; set; }

        public DateTime? CitizenshipIssueDate { get; set; }

        [MaxLength(100)]
        public string? CitizenshipIssueDistrict { get; set; }

        [MaxLength(50)]
        public string? PanNo { get; set; }
    }
}
