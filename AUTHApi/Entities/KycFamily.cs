using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    /// <summary>
    /// Section 3: Family Information.
    /// Linked 1:1 with the main KycForm.
    /// </summary>
    public class KycFamily
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int KycFormId { get; set; }

        [ForeignKey("KycFormId")]
        public virtual KycForm? KycForm { get; set; }

        [MaxLength(255)]
        public string? FatherName { get; set; }

        [MaxLength(255)]
        public string? MotherName { get; set; }

        [MaxLength(255)]
        public string? GrandfatherName { get; set; }

        [MaxLength(255)]
        public string? SpouseName { get; set; }

        /// <summary>
        /// Can store multiple names as a comma-separated string or JSON.
        /// </summary>
        public string? ChildrenNames { get; set; }

        public string? InlawsNames { get; set; }
    }
}
