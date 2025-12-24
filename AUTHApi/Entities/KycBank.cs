using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AUTHApi.Entities
{
    /// <summary>
    /// Section 4: Bank Account and Financial Institution details.
    /// Linked 1:1 with the main KycForm.
    /// </summary>
    public class KycBank
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int KycFormId { get; set; }

        [ForeignKey("KycFormId")]
        public virtual KycForm? KycForm { get; set; }

        [MaxLength(50)]
        public string? AccountType { get; set; }

        [MaxLength(50)]
        public string? AccountNumber { get; set; }

        [MaxLength(255)]
        public string? BankName { get; set; }

        public string? BankAddress { get; set; }
    }
}
