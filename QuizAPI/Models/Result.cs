using System;

namespace QuizAPI.Models
{
    public class Result
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int QuizId { get; set; }
        public Quiz? Quiz { get; set; }
        
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    }
}
