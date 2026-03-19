using QuizAPI.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizAPI.Services
{
    public interface IResultService
    {
        Task<QuizSubmissionResultDto> SubmitQuizAsync(QuizSubmissionDto submissionDto);
        Task<IEnumerable<ResultDto>> GetResultsByUserIdAsync(int userId);
        Task<IEnumerable<QuizHistoryDto>> GetQuizHistoryByUserIdAsync(int userId);
        Task<AdminAnalyticsDto> GetAdminAnalyticsAsync();
        /// <summary>Returns top-N results sorted by score descending for the leaderboard.</summary>
        Task<IEnumerable<LeaderboardEntryDto>> GetLeaderboardAsync(int topN = 20);
    }
}
