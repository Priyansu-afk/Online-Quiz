using QuizAPI.DTOs;
using QuizAPI.Models;
using QuizAPI.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuizAPI.Services
{
    public class QuizService : IQuizService
    {
        private readonly IRepository<Quiz> _quizRepository;
        private readonly IRepository<Question> _questionRepository;

        public QuizService(IRepository<Quiz> quizRepository, IRepository<Question> questionRepository)
        {
            _quizRepository = quizRepository;
            _questionRepository = questionRepository;
        }

        public async Task<IEnumerable<QuizDto>> GetAllQuizzesAsync(string? category = null, string? difficulty = null)
        {
            var quizzes = await _quizRepository.GetAllAsync();

            var filtered = quizzes.AsQueryable();
            if (!string.IsNullOrWhiteSpace(category))
            {
                filtered = filtered.Where(q => q.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(difficulty))
            {
                filtered = filtered.Where(q => q.Difficulty.Equals(difficulty, StringComparison.OrdinalIgnoreCase));
            }

            return filtered.Select(q => new QuizDto
            {
                Id = q.Id,
                Title = q.Title,
                Description = q.Description,
                Category = q.Category,
                Difficulty = q.Difficulty,
                IsActive = q.IsActive,
                Duration = q.Duration
            });
        }

        public async Task<QuizDto?> GetQuizByIdAsync(int id)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz == null) return null;

            var questions = await _questionRepository.FindAsync(q => q.QuizId == id);
            
            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Category = quiz.Category,
                Difficulty = quiz.Difficulty,
                IsActive = quiz.IsActive,
                Duration = quiz.Duration,
                Questions = questions.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    QuizId = q.QuizId,
                    Text = q.Text,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    CorrectOption = q.CorrectOption,
                    Explanation = q.Explanation
                }).ToList()
            };
        }

        public async Task<QuizDto> CreateQuizAsync(QuizCreateDto quizDto)
        {
            var quiz = new Quiz
            {
                Title = quizDto.Title,
                Description = quizDto.Description,
                Category = quizDto.Category,
                Difficulty = quizDto.Difficulty,
                IsActive = quizDto.IsActive,
                Duration = quizDto.Duration
            };

            await _quizRepository.AddAsync(quiz);

            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Category = quiz.Category,
                Difficulty = quiz.Difficulty,
                IsActive = quiz.IsActive,
                Duration = quiz.Duration
            };
        }

        public async Task<IEnumerable<QuestionDto>> GetQuestionsByQuizIdAsync(int quizId)
        {
            var questions = await _questionRepository.FindAsync(q => q.QuizId == quizId);
            return questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                QuizId = q.QuizId,
                Text = q.Text,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectOption = q.CorrectOption,
                Explanation = q.Explanation
            });
        }

        public async Task<IEnumerable<PlayQuestionDto>> GetRandomizedQuestionsByQuizIdAsync(int quizId, int? takeCount = null)
        {
            var questions = await _questionRepository.FindAsync(q => q.QuizId == quizId);

            var randomized = questions
                .OrderBy(_ => Guid.NewGuid())
                .ToList();

            if (takeCount.HasValue && takeCount.Value > 0)
            {
                randomized = randomized.Take(takeCount.Value).ToList();
            }

            return randomized.Select(q =>
            {
                var options = new List<string> { q.OptionA, q.OptionB, q.OptionC, q.OptionD }
                    .OrderBy(_ => Guid.NewGuid())
                    .ToList();

                return new PlayQuestionDto
                {
                    Id = q.Id,
                    QuizId = q.QuizId,
                    Text = q.Text,
                    OptionA = options[0],
                    OptionB = options[1],
                    OptionC = options[2],
                    OptionD = options[3]
                };
            });
        }

        public async Task<QuestionDto> AddQuestionAsync(QuestionCreateDto dto)
        {
            var q = new Question
            {
                QuizId = dto.QuizId,
                Text = dto.Text,
                OptionA = dto.OptionA,
                OptionB = dto.OptionB,
                OptionC = dto.OptionC,
                OptionD = dto.OptionD,
                CorrectOption = dto.CorrectOption,
                Explanation = dto.Explanation
            };

            await _questionRepository.AddAsync(q);

            return new QuestionDto
            {
                Id = q.Id,
                QuizId = q.QuizId,
                Text = q.Text,
                OptionA = q.OptionA,
                OptionB = q.OptionB,
                OptionC = q.OptionC,
                OptionD = q.OptionD,
                CorrectOption = q.CorrectOption,
                Explanation = q.Explanation
            };
        }
    }
}
