using System;
using System.Collections.Generic;

namespace QuizAPI.DTOs
{
    public class ResultDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime CompletedAt { get; set; }
    }

    public class QuizReviewItemDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string UserAnswer { get; set; } = string.Empty;
        public string CorrectAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    public class QuizSubmissionResultDto : ResultDto
    {
        public List<QuizReviewItemDto> ReviewItems { get; set; } = new List<QuizReviewItemDto>();
    }

    public class QuizHistoryDto
    {
        public int UserId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime DateAttempted { get; set; }
    }

    public class TopQuizAnalyticsDto
    {
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int AttemptCount { get; set; }
    }

    public class AdminAnalyticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalQuizzesAttempted { get; set; }
        public double AverageScorePercent { get; set; }
        public TopQuizAnalyticsDto? MostPopularQuiz { get; set; }
        public List<TopQuizAnalyticsDto> QuizAttempts { get; set; } = new List<TopQuizAnalyticsDto>();
    }

    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string Username { get; set; } = string.Empty;
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime DateTaken { get; set; }
    }

    public class QuizSubmissionDto
    {
        public int QuizId { get; set; }
        public int UserId { get; set; }
        public List<AnswerDto> Answers { get; set; } = new List<AnswerDto>();
    }

    public class AnswerDto
    {
        public int QuestionId { get; set; }
        public string SelectedOption { get; set; } = string.Empty;
    }
}
