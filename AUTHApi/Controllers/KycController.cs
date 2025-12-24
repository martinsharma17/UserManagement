using AUTHApi.Data;
using AUTHApi.Entities;
using AUTHApi.Models.KYC;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AUTHApi.Controllers
{
    /// <summary>
    /// Controller for handling multi-step KYC form submissions and management.
    /// Supports progressive saving per section and Maker/Checker workflow.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class KycController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public KycController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        /// <summary>
        /// Retrieves the current authenticated user's KYC form with all filled sections.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<KycFormDto>> GetMyKyc()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var kyc = await _context.KycForms
                .Include(f => f.PersonalInfo)
                .Include(f => f.Address)
                .Include(f => f.Family)
                .Include(f => f.Bank)
                .Include(f => f.Occupation)
                .Include(f => f.Guardian)
                .Include(f => f.Legal)
                .Include(f => f.Investment)
                .Include(f => f.Attachments)
                .FirstOrDefaultAsync(f => f.UserId == userId);

            if (kyc == null)
            {
                // Create a basic form if it doesn't exist
                kyc = new KycForm { UserId = userId, Status = KycStatus.Draft, CurrentStep = 1 };
                _context.KycForms.Add(kyc);
                await _context.SaveChangesAsync();
            }

            return Ok(MapToDto(kyc));
        }

        /// <summary>
        /// Progressively saves or updates Section 1: Personal Information.
        /// </summary>
        [HttpPost("section/personal-info")]
        public async Task<IActionResult> SavePersonalInfo([FromBody] KycPersonalInfoDto dto)
        {
            var kyc = await GetOrCreateKyc();
            if (kyc.Status == KycStatus.ApprovedByChecker) return BadRequest("KYC is already approved and locked.");

            if (kyc.PersonalInfo == null) kyc.PersonalInfo = new KycPersonalInfo();
            
            kyc.PersonalInfo.FullName = dto.FullName;
            kyc.PersonalInfo.DobAd = dto.DobAd;
            kyc.PersonalInfo.DobBs = dto.DobBs;
            kyc.PersonalInfo.Gender = dto.Gender;
            kyc.PersonalInfo.Nationality = dto.Nationality;
            kyc.PersonalInfo.CitizenshipNo = dto.CitizenshipNo;
            kyc.PersonalInfo.CitizenshipIssueDate = dto.CitizenshipIssueDate;
            kyc.PersonalInfo.CitizenshipIssueDistrict = dto.CitizenshipIssueDistrict;
            kyc.PersonalInfo.PanNo = dto.PanNo;

            kyc.CurrentStep = Math.Max(kyc.CurrentStep, 2);
            kyc.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Personal Info saved", nextStep = kyc.CurrentStep });
        }

        /// <summary>
        /// Progressively saves or updates Section 2: Address Information.
        /// </summary>
        [HttpPost("section/address")]
        public async Task<IActionResult> SaveAddress([FromBody] KycAddressDto dto)
        {
            var kyc = await GetOrCreateKyc();
            if (kyc.Status == KycStatus.ApprovedByChecker) return BadRequest("KYC is already approved and locked.");

            if (kyc.Address == null) kyc.Address = new KycAddress();

            kyc.Address.CurrentMunicipality = dto.CurrentMunicipality;
            kyc.Address.CurrentDistrict = dto.CurrentDistrict;
            kyc.Address.CurrentProvince = dto.CurrentProvince;
            kyc.Address.CurrentCountry = dto.CurrentCountry;
            kyc.Address.PermanentMunicipality = dto.PermanentMunicipality;
            kyc.Address.PermanentDistrict = dto.PermanentDistrict;
            kyc.Address.PermanentProvince = dto.PermanentProvince;
            kyc.Address.PermanentCountry = dto.PermanentCountry;
            kyc.Address.WardNo = dto.WardNo;
            kyc.Address.ContactNumber = dto.ContactNumber;
            kyc.Address.Email = dto.Email;

            kyc.CurrentStep = Math.Max(kyc.CurrentStep, 3);
            kyc.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Address saved", nextStep = kyc.CurrentStep });
        }

        /// <summary>
        /// Saves Section 3: Family Information.
        /// </summary>
        [HttpPost("section/family")]
        public async Task<IActionResult> SaveFamily([FromBody] KycFamilyDto dto)
        {
            var kyc = await GetOrCreateKyc();
            if (kyc.Status == KycStatus.ApprovedByChecker) return BadRequest("KYC is locked.");

            if (kyc.Family == null) kyc.Family = new KycFamily();
            kyc.Family.FatherName = dto.FatherName;
            kyc.Family.MotherName = dto.MotherName;
            kyc.Family.GrandfatherName = dto.GrandfatherName;
            kyc.Family.SpouseName = dto.SpouseName;
            kyc.Family.ChildrenNames = dto.ChildrenNames;
            kyc.Family.InlawsNames = dto.InlawsNames;

            kyc.CurrentStep = Math.Max(kyc.CurrentStep, 4);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Family info saved", nextStep = kyc.CurrentStep });
        }

        /// <summary>
        /// Saves Section 4: Bank Information.
        /// </summary>
        [HttpPost("section/bank")]
        public async Task<IActionResult> SaveBank([FromBody] KycBankDto dto)
        {
            var kyc = await GetOrCreateKyc();
            if (kyc.Status == KycStatus.ApprovedByChecker) return BadRequest("KYC is locked.");

            if (kyc.Bank == null) kyc.Bank = new KycBank();
            kyc.Bank.AccountType = dto.AccountType;
            kyc.Bank.AccountNumber = dto.AccountNumber;
            kyc.Bank.BankName = dto.BankName;
            kyc.Bank.BankAddress = dto.BankAddress;

            kyc.CurrentStep = Math.Max(kyc.CurrentStep, 5);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Bank info saved", nextStep = kyc.CurrentStep });
        }

        /// <summary>
        /// Saves Section 5: Occupation Information.
        /// </summary>
        [HttpPost("section/occupation")]
        public async Task<IActionResult> SaveOccupation([FromBody] KycOccupationDto dto)
        {
            var kyc = await GetOrCreateKyc();
            if (kyc.Status == KycStatus.ApprovedByChecker) return BadRequest("KYC is locked.");

            if (kyc.Occupation == null) kyc.Occupation = new KycOccupation();
            kyc.Occupation.Occupation = dto.Occupation;
            kyc.Occupation.OrgName = dto.OrgName;
            kyc.Occupation.OrgAddress = dto.OrgAddress;
            kyc.Occupation.Designation = dto.Designation;
            kyc.Occupation.EmployeeIdNo = dto.EmployeeIdNo;
            kyc.Occupation.AnnualIncomeBracket = dto.AnnualIncomeBracket;

            kyc.CurrentStep = Math.Max(kyc.CurrentStep, 6);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Occupation info saved", nextStep = kyc.CurrentStep });
        }

        /// <summary>
        /// Maker Verification: Submits the KYC for Checker approval.
        /// </summary>
        [HttpPost("verify")]
        [Authorize(Roles = "SuperAdmin,Admin,Manager")] // roles that can act as Maker
        public async Task<IActionResult> VerifyKyc()
        {
            var kyc = await GetOrCreateKyc();
            if (kyc.CurrentStep < 8) return BadRequest("Please complete all sections before verifying.");
            
            kyc.Status = KycStatus.VerifiedByMaker;
            kyc.MakerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            kyc.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "KYC verified and pending approval" });
        }

        /// <summary>
        /// Checker Approval: Finalizes the KYC form.
        /// </summary>
        [HttpPost("approve/{kycId}")]
        [Authorize(Roles = "SuperAdmin,Admin")] // roles that can act as Checker
        public async Task<IActionResult> ApproveKyc(int kycId)
        {
            var kyc = await _context.KycForms.FindAsync(kycId);
            if (kyc == null) return NotFound();
            if (kyc.Status != KycStatus.VerifiedByMaker) return BadRequest("KYC is not in verified state.");

            kyc.Status = KycStatus.ApprovedByChecker;
            kyc.CheckerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            kyc.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "KYC approved successfully" });
        }

        // --- Helper Methods ---

        private async Task<KycForm> GetOrCreateKyc()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var kyc = await _context.KycForms
                .Include(f => f.PersonalInfo)
                .Include(f => f.Address)
                .Include(f => f.Family)
                .Include(f => f.Bank)
                .Include(f => f.Occupation)
                .Include(f => f.Guardian)
                .Include(f => f.Legal)
                .Include(f => f.Investment)
                .FirstOrDefaultAsync(f => f.UserId == userId);

            if (kyc == null)
            {
                kyc = new KycForm { UserId = userId!, Status = KycStatus.Draft, CurrentStep = 1 };
                _context.KycForms.Add(kyc);
                await _context.SaveChangesAsync();
            }
            return kyc;
        }

        private KycFormDto MapToDto(KycForm kyc)
        {
            return new KycFormDto
            {
                Id = kyc.Id,
                Status = kyc.Status.ToString(),
                CurrentStep = kyc.CurrentStep,
                PersonalInfo = kyc.PersonalInfo == null ? null : new KycPersonalInfoDto
                {
                    FullName = kyc.PersonalInfo.FullName,
                    DobAd = kyc.PersonalInfo.DobAd,
                    DobBs = kyc.PersonalInfo.DobBs,
                    Gender = kyc.PersonalInfo.Gender,
                    Nationality = kyc.PersonalInfo.Nationality,
                    CitizenshipNo = kyc.PersonalInfo.CitizenshipNo,
                    CitizenshipIssueDate = kyc.PersonalInfo.CitizenshipIssueDate,
                    CitizenshipIssueDistrict = kyc.PersonalInfo.CitizenshipIssueDistrict,
                    PanNo = kyc.PersonalInfo.PanNo
                },
                Address = kyc.Address == null ? null : new KycAddressDto
                {
                    CurrentMunicipality = kyc.Address.CurrentMunicipality,
                    CurrentDistrict = kyc.Address.CurrentDistrict,
                    CurrentProvince = kyc.Address.CurrentProvince,
                    CurrentCountry = kyc.Address.CurrentCountry,
                    PermanentMunicipality = kyc.Address.PermanentMunicipality,
                    PermanentDistrict = kyc.Address.PermanentDistrict,
                    PermanentProvince = kyc.Address.PermanentProvince,
                    PermanentCountry = kyc.Address.PermanentCountry,
                    WardNo = kyc.Address.WardNo,
                    ContactNumber = kyc.Address.ContactNumber,
                    Email = kyc.Address.Email
                },
                Family = kyc.Family == null ? null : new KycFamilyDto
                {
                    FatherName = kyc.Family.FatherName,
                    MotherName = kyc.Family.MotherName,
                    GrandfatherName = kyc.Family.GrandfatherName,
                    SpouseName = kyc.Family.SpouseName,
                    ChildrenNames = kyc.Family.ChildrenNames,
                    InlawsNames = kyc.Family.InlawsNames
                },
                Bank = kyc.Bank == null ? null : new KycBankDto
                {
                    AccountType = kyc.Bank.AccountType,
                    AccountNumber = kyc.Bank.AccountNumber,
                    BankName = kyc.Bank.BankName,
                    BankAddress = kyc.Bank.BankAddress
                },
                Occupation = kyc.Occupation == null ? null : new KycOccupationDto
                {
                    Occupation = kyc.Occupation.Occupation,
                    OrgName = kyc.Occupation.OrgName,
                    OrgAddress = kyc.Occupation.OrgAddress,
                    Designation = kyc.Occupation.Designation,
                    EmployeeIdNo = kyc.Occupation.EmployeeIdNo,
                    AnnualIncomeBracket = kyc.Occupation.AnnualIncomeBracket
                },
                Guardian = kyc.Guardian == null ? null : new KycGuardianDto
                {
                    Name = kyc.Guardian.Name,
                    Relationship = kyc.Guardian.Relationship,
                    Address = kyc.Guardian.Address,
                    ContactNo = kyc.Guardian.ContactNo,
                    Email = kyc.Guardian.Email,
                    PanNo = kyc.Guardian.PanNo,
                    Dob = kyc.Guardian.Dob,
                    IssueDistrict = kyc.Guardian.IssueDistrict
                },
                Legal = kyc.Legal == null ? null : new KycLegalDto
                {
                    DeclarationText = kyc.Legal.DeclarationText,
                    ConsentDate = kyc.Legal.ConsentDate,
                    IsAgreed = kyc.Legal.IsAgreed
                },
                Investment = kyc.Investment == null ? null : new KycInvestmentDto
                {
                    Details = kyc.Investment.Details,
                    IsInvolved = kyc.Investment.IsInvolved
                },
                Attachments = kyc.Attachments.Select(a => new KycAttachmentDto
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileType = a.FileType,
                    FilePath = a.FilePath,
                    UploadedAt = a.UploadedAt
                }).ToList()
            };
        }
    }
}
