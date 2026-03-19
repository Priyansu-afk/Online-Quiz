using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizAPI.DTOs;
using QuizAPI.Services;
using System.Threading.Tasks;

namespace QuizAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuestionController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuestionController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpGet("quiz/{quizId}")]
        public async Task<IActionResult> GetQuestionsByQuizId(int quizId)
        {
            var questions = await _quizService.GetQuestionsByQuizIdAsync(quizId);
            return Ok(questions);
        }

        [HttpGet("quiz/{quizId}/play")]
        public async Task<IActionResult> GetRandomizedQuestionsForPlay(int quizId, [FromQuery] int? count = null)
        {
            var questions = await _quizService.GetRandomizedQuestionsByQuizIdAsync(quizId, count);
            return Ok(questions);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddQuestion([FromBody] QuestionCreateDto dto)
        {
            var question = await _quizService.AddQuestionAsync(dto);
            return Ok(question);
        }
    }
}
