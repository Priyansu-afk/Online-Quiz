using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizAPI.Migrations
{
    public partial class AddQuizCategoryDifficultyAndQuestionExplanation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Use IF NOT EXISTS to safely handle cases where SyncSnapshotForAdvancedFeatures
            // already added these columns.
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Quizzes' AND column_name = 'Category'
                    ) THEN
                        ALTER TABLE ""Quizzes"" ADD COLUMN ""Category"" text NOT NULL DEFAULT 'General';
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Quizzes' AND column_name = 'Difficulty'
                    ) THEN
                        ALTER TABLE ""Quizzes"" ADD COLUMN ""Difficulty"" text NOT NULL DEFAULT 'Medium';
                    END IF;

                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'Questions' AND column_name = 'Explanation'
                    ) THEN
                        ALTER TABLE ""Questions"" ADD COLUMN ""Explanation"" text NOT NULL DEFAULT '';
                    END IF;
                END $$;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Category",    table: "Quizzes");
            migrationBuilder.DropColumn(name: "Difficulty",  table: "Quizzes");
            migrationBuilder.DropColumn(name: "Explanation", table: "Questions");
        }
    }
}
