using QuizAPI.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizAPI.Services
{
    public interface IQuizService
    {
        Task<IEnumerable<QuizDto>> GetAllQuizzesAsync(string? category = null, string? difficulty = null);
        Task<QuizDto?> GetQuizByIdAsync(int id);
        Task<QuizDto> CreateQuizAsync(QuizCreateDto quizDto);
        Task<IEnumerable<QuestionDto>> GetQuestionsByQuizIdAsync(int quizId);
        Task<IEnumerable<PlayQuestionDto>> GetRandomizedQuestionsByQuizIdAsync(int quizId, int? takeCount = null);
        Task<QuestionDto> AddQuestionAsync(QuestionCreateDto questionDto);
    }
}
