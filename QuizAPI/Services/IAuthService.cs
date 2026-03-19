using QuizAPI.DTOs;
using System.Threading.Tasks;

namespace QuizAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(UserLoginDto request);
        Task<AuthResponseDto?> RegisterAsync(UserRegisterDto request);
    }
}
