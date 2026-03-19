using QuizAPI.DTOs;
using QuizAPI.Models;
using QuizAPI.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuizAPI.Services
{
    public class ResultService : IResultService
    {
        private readonly IRepository<Result> _resultRepository;
        private readonly IRepository<Question> _questionRepository;
        private readonly IRepository<Quiz> _quizRepository;
        private readonly IRepository<User> _userRepository;

        public ResultService(IRepository<Result> resultRepository, IRepository<Question> questionRepository, IRepository<Quiz> quizRepository, IRepository<User> userRepository)
        {
            _resultRepository = resultRepository;
            _questionRepository = questionRepository;
            _quizRepository = quizRepository;
            _userRepository = userRepository;
        }

        public async Task<QuizSubmissionResultDto> SubmitQuizAsync(QuizSubmissionDto dto)
        {
            try
            {
                if (dto == null || dto.Answers == null)
                    throw new ArgumentException("Invalid submission data");
                
                var questions = await _questionRepository.FindAsync(q => q.QuizId == dto.QuizId);
                if (!questions.Any())
                    throw new ArgumentException("No questions found for this quiz");
                
                int score = 0;
                var reviewItems = new List<QuizReviewItemDto>();
                
                foreach (var answer in dto.Answers)
                {
                    var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                    if (question == null)
                    {
                        continue;
                    }

                    var correctAnswer = GetAnswerText(question, question.CorrectOption);
                    var isCorrect = correctAnswer.Equals(answer.SelectedOption, StringComparison.OrdinalIgnoreCase)
                        || question.CorrectOption.Equals(answer.SelectedOption, StringComparison.OrdinalIgnoreCase);
                    if (isCorrect)
                    {
                        score++;
                    }

                    reviewItems.Add(new QuizReviewItemDto
                    {
                        QuestionId = question.Id,
                        QuestionText = question.Text,
                        UserAnswer = answer.SelectedOption,
                        CorrectAnswer = correctAnswer,
                        IsCorrect = isCorrect,
                        Explanation = question.Explanation
                    });
                }

                // Include unanswered questions in review payload as empty answer.
                foreach (var question in questions.Where(q => dto.Answers.All(a => a.QuestionId != q.Id)))
                {
                    reviewItems.Add(new QuizReviewItemDto
                    {
                        QuestionId = question.Id,
                        QuestionText = question.Text,
                        UserAnswer = string.Empty,
                        CorrectAnswer = GetAnswerText(question, question.CorrectOption),
                        IsCorrect = false,
                        Explanation = question.Explanation
                    });
                }

                var result = new Result
                {
                    UserId = dto.UserId,
                    QuizId = dto.QuizId,
                    Score = score,
                    TotalQuestions = questions.Count(),
                    CompletedAt = DateTime.UtcNow
                };

                await _resultRepository.AddAsync(result);

                // Fetch relations for DTO details
                var user = await _userRepository.GetByIdAsync(dto.UserId);
                var quiz = await _quizRepository.GetByIdAsync(dto.QuizId);

                if (user == null)
                    throw new ArgumentException($"User with ID {dto.UserId} not found");
                
                if (quiz == null)
                    throw new ArgumentException($"Quiz with ID {dto.QuizId} not found");

                return new QuizSubmissionResultDto
                {
                    Id = result.Id,
                    UserId = result.UserId,
                    Username = user.Username ?? "",
                    QuizId = result.QuizId,
                    QuizTitle = quiz.Title ?? "",
                    Score = result.Score,
                    TotalQuestions = result.TotalQuestions,
                    CompletedAt = result.CompletedAt,
                    ReviewItems = reviewItems.OrderBy(i => i.QuestionId).ToList()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SubmitQuizAsync: {ex.Message}");
                throw;
            }
        }

        private static string GetAnswerText(Question question, string optionKey)
        {
            return optionKey.ToUpperInvariant() switch
            {
                "A" => question.OptionA,
                "B" => question.OptionB,
                "C" => question.OptionC,
                "D" => question.OptionD,
                _ => string.Empty
            };
        }

        public async Task<IEnumerable<ResultDto>> GetResultsByUserIdAsync(int userId)
        {
            var results = await _resultRepository.FindAsync(r => r.UserId == userId);
            
            var resultDtos = new List<ResultDto>();
            foreach (var r in results)
            {
                var quiz = await _quizRepository.GetByIdAsync(r.QuizId);
                resultDtos.Add(new ResultDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    QuizId = r.QuizId,
                    QuizTitle = quiz?.Title ?? "",
                    Score = r.Score,
                    TotalQuestions = r.TotalQuestions,
                    CompletedAt = r.CompletedAt
                });
            }

            return resultDtos;
        }

        public async Task<IEnumerable<QuizHistoryDto>> GetQuizHistoryByUserIdAsync(int userId)
        {
            var results = await _resultRepository.FindAsync(r => r.UserId == userId);

            var history = new List<QuizHistoryDto>();
            foreach (var r in results.OrderByDescending(r => r.CompletedAt))
            {
                var quiz = await _quizRepository.GetByIdAsync(r.QuizId);
                history.Add(new QuizHistoryDto
                {
                    UserId = r.UserId,
                    QuizId = r.QuizId,
                    QuizTitle = quiz?.Title ?? string.Empty,
                    Score = r.Score,
                    TotalQuestions = r.TotalQuestions,
                    DateAttempted = r.CompletedAt
                });
            }

            return history;
        }

        public async Task<AdminAnalyticsDto> GetAdminAnalyticsAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var results = await _resultRepository.GetAllAsync();
            var quizzes = await _quizRepository.GetAllAsync();

            var resultList = results.ToList();
            var quizAttempts = resultList
                .GroupBy(r => r.QuizId)
                .Select(g =>
                {
                    var quizTitle = quizzes.FirstOrDefault(q => q.Id == g.Key)?.Title ?? "Unknown";
                    return new TopQuizAnalyticsDto
                    {
                        QuizId = g.Key,
                        QuizTitle = quizTitle,
                        AttemptCount = g.Count()
                    };
                })
                .OrderByDescending(x => x.AttemptCount)
                .ToList();

            var avgScorePercent = resultList.Any()
                ? resultList.Average(r => r.TotalQuestions == 0 ? 0 : (double)r.Score / r.TotalQuestions * 100)
                : 0;

            return new AdminAnalyticsDto
            {
                TotalUsers = users.Count(),
                TotalQuizzesAttempted = resultList.Count,
                AverageScorePercent = Math.Round(avgScorePercent, 2),
                MostPopularQuiz = quizAttempts.FirstOrDefault(),
                QuizAttempts = quizAttempts.Take(10).ToList()
            };
        }

        /// <summary>
        /// Fetches all results, enriches with username/quiz title, sorts by score descending,
        /// assigns rank and returns the top-N entries.
        /// </summary>
        public async Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(int topN = 20)
        {
            var results = await _resultRepository.GetAllAsync();

            var entries = new List<LeaderboardEntryDto>();
            foreach (var r in results)
            {
                var user = await _userRepository.GetByIdAsync(r.UserId);
                var quiz = await _quizRepository.GetByIdAsync(r.QuizId);

                entries.Add(new LeaderboardEntryDto
                {
                    Username = user?.Username ?? "Unknown",
                    QuizTitle = quiz?.Title ?? "Unknown",
                    Score = r.Score,
                    TotalQuestions = r.TotalQuestions,
                    DateTaken = r.CompletedAt
                });
            }

            // Sort by score descending, then by date ascending (earlier = better for ties)
            var ranked = entries
                .OrderByDescending(e => e.Score)
                .ThenBy(e => e.DateTaken)
                .Take(topN)
                .ToList();

            // Assign rank numbers
            for (int i = 0; i < ranked.Count; i++)
                ranked[i].Rank = i + 1;

            return ranked;
        }
    }
}
