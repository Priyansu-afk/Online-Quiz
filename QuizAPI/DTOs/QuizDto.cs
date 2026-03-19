using System.Collections.Generic;

namespace QuizAPI.DTOs
{
    public class QuizDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public string Difficulty { get; set; } = "Medium";
        public bool IsActive { get; set; }
        /// <summary>Duration in minutes shown to the timer.</summary>
        public int Duration { get; set; }
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }

    public class QuizCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public string Difficulty { get; set; } = "Medium";
        public bool IsActive { get; set; } = true;
        /// <summary>Duration in minutes (default 10).</summary>
        public int Duration { get; set; } = 10;
    }
}
