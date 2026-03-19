using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizAPI.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelWithEf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'Quizzes'
                          AND column_name = 'Duration'
                    ) THEN
                        ALTER TABLE ""Quizzes"" ADD COLUMN ""Duration"" integer NOT NULL DEFAULT 10;
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql("ALTER TABLE \"Quizzes\" ALTER COLUMN \"Duration\" DROP DEFAULT;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                          AND table_name = 'Quizzes'
                          AND column_name = 'Duration'
                    ) THEN
                        ALTER TABLE ""Quizzes"" ALTER COLUMN ""Duration"" SET DEFAULT 10;
                    END IF;
                END $$;
            ");
        }
    }
}
