using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizAPI.DTOs;
using QuizAPI.Services;
using System.Threading.Tasks;

namespace QuizAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResultController : ControllerBase
    {
        private readonly IResultService _resultService;

        public ResultController(IResultService resultService)
        {
            _resultService = resultService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] QuizSubmissionDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest("Submission data is required");
                
                var result = await _resultService.SubmitQuizAsync(dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SubmitQuiz endpoint: {ex.Message}");
                return StatusCode(500, new { error = "An error occurred while submitting the quiz", details = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserResults(int userId)
        {
            var results = await _resultService.GetResultsByUserIdAsync(userId);
            return Ok(results);
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetUserQuizHistory(int userId)
        {
            var history = await _resultService.GetQuizHistoryByUserIdAsync(userId);
            return Ok(history);
        }

        /// <summary>
        /// GET /api/result/leaderboard?topN=20
        /// Returns top-N players sorted by score descending.
        /// Accessible to all authenticated users.
        /// </summary>
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard([FromQuery] int topN = 20)
        {
            var leaderboard = await _resultService.GetLeaderboardAsync(topN);
            return Ok(leaderboard);
        }

        [HttpGet("admin/analytics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminAnalytics()
        {
            var analytics = await _resultService.GetAdminAnalyticsAsync();
            return Ok(analytics);
        }
    }
}
