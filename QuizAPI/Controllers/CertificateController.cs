using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizAPI.Data;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace QuizAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CertificateController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CertificateController(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// GET /api/certificate/{resultId}
        /// Returns a PDF certificate if the user scored more than 80%.
        /// </summary>
        [HttpGet("{resultId}")]
        public async Task<IActionResult> DownloadCertificate(int resultId)
        {
            var result = await _db.Results
                .Include(r => r.User)
                .Include(r => r.Quiz)
                .FirstOrDefaultAsync(r => r.Id == resultId);

            if (result == null)
                return NotFound(new { error = "Result not found." });

            double pct = result.TotalQuestions == 0
                ? 0
                : (double)result.Score / result.TotalQuestions * 100;

            if (pct <= 80)
                return BadRequest(new { error = "Certificate is only available for scores above 80%." });

            var username  = result.User?.Username  ?? "Unknown";
            var quizTitle = result.Quiz?.Title     ?? "Unknown Quiz";
            var scoreText = $"{result.Score} / {result.TotalQuestions}";
            var pctText   = $"{pct:F1}%";
            var dateText  = result.CompletedAt.ToString("MMMM dd, yyyy");

            var pdfBytes = GenerateCertificatePdf(username, quizTitle, scoreText, pctText, dateText);

            return File(pdfBytes, "application/pdf",
                $"Certificate_{username}_{quizTitle.Replace(" ", "_")}.pdf");
        }

        private static byte[] GenerateCertificatePdf(
            string username, string quizTitle,
            string score, string pct, string date)
        {
            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0);
                    page.DefaultTextStyle(t => t.FontFamily("Arial"));

                    page.Content().Element(BuildContent);

                    void BuildContent(IContainer root)
                    {
                        root
                          .Background("#0d0d1a")
                          .Padding(40)
                          .Column(col =>
                          {
                              col.Spacing(0);

                              // Outer decorative border
                              col.Item()
                                 .Border(4)
                                 .BorderColor("#6366f1")
                                 .Padding(32)
                                 .Column(inner =>
                                 {
                                     inner.Spacing(20);

                                     // Header strip
                                     inner.Item()
                                          .Background("#6366f1")
                                          .PaddingVertical(12)
                                          .PaddingHorizontal(20)
                                          .AlignCenter()
                                          .Text("CERTIFICATE OF ACHIEVEMENT")
                                          .FontSize(14)
                                          .FontColor("#ffffff")
                                          .Bold()
                                          .LetterSpacing(3);

                                     // Main title
                                     inner.Item()
                                          .AlignCenter()
                                          .Text("Certificate of Excellence")
                                          .FontSize(32)
                                          .FontColor("#a78bfa")
                                          .Bold();

                                     // Subtitle
                                     inner.Item()
                                          .AlignCenter()
                                          .Text("This is to certify that")
                                          .FontSize(13)
                                          .FontColor("#94a3b8");

                                     // User name
                                     inner.Item()
                                          .AlignCenter()
                                          .Text(username)
                                          .FontSize(36)
                                          .FontColor("#ffffff")
                                          .Bold();

                                     // Description
                                     inner.Item()
                                          .AlignCenter()
                                          .Text("has successfully completed the quiz")
                                          .FontSize(13)
                                          .FontColor("#94a3b8");

                                     // Quiz title
                                     inner.Item()
                                          .AlignCenter()
                                          .Text(quizTitle)
                                          .FontSize(22)
                                          .FontColor("#38bdf8")
                                          .Bold();

                                     // Score row
                                     inner.Item()
                                          .AlignCenter()
                                          .Text($"with a score of  {score}  ({pct})")
                                          .FontSize(16)
                                          .FontColor("#22c55e")
                                          .Bold();

                                     // Decorative divider
                                     inner.Item()
                                          .PaddingHorizontal(60)
                                          .PaddingVertical(8)
                                          .LineHorizontal(1)
                                          .LineColor("#334155");

                                     // Date + congrats row
                                     inner.Item()
                                          .Row(row =>
                                          {
                                              row.RelativeItem()
                                                 .AlignLeft()
                                                 .Text($"Date: {date}")
                                                 .FontSize(11)
                                                 .FontColor("#64748b");

                                              row.RelativeItem()
                                                 .AlignCenter()
                                                 .Text("🏆  Outstanding Performance")
                                                 .FontSize(12)
                                                 .FontColor("#fbbf24")
                                                 .Bold();

                                              row.RelativeItem()
                                                 .AlignRight()
                                                 .Text("Online Quiz System")
                                                 .FontSize(11)
                                                 .FontColor("#64748b");
                                          });
                                 });
                          });
                    }
                });
            });

            return doc.GeneratePdf();
        }
    }
}
