using System.Collections.Generic;

namespace QuizAPI.Models
{
    public class Quiz
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public string Difficulty { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        /// <summary>Quiz duration in minutes (used by the countdown timer).</summary>
        public int Duration { get; set; } = 10;
        
        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<Result> Results { get; set; } = new List<Result>();
    }
}
