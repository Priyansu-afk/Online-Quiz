using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using QuizAPI.DTOs;
using QuizAPI.Models;
using QuizAPI.Repositories;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace QuizAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto?> LoginAsync(UserLoginDto request)
        {
            var users = await _userRepository.FindAsync(u => u.Username == request.Username);
            var user = users.FirstOrDefault();
            
            if (user == null || !VerifyPasswordHash(request.Password, user.PasswordHash))
                return null;

            return new AuthResponseDto
            {
                Token = CreateToken(user),
                Username = user.Username,
                Role = user.Role
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(UserRegisterDto request)
        {
            var users = await _userRepository.FindAsync(u => u.Username == request.Username);
            if (users.Any()) return null; // Username exists

            var user = new User
            {
                Username = request.Username,
                PasswordHash = HashPassword(request.Password),
                Role = request.Role
            };

            await _userRepository.AddAsync(user);

            return new AuthResponseDto
            {
                Token = CreateToken(user),
                Username = user.Username,
                Role = user.Role
            };
        }

        private string CreateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            // Ensure a key is configured in appsettings
            var keyString = _configuration.GetSection("AppSettings:Token").Value ?? "super-secret-key-that-is-very-long!";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            // Simplified hashing for demo. Should use BCrypt in prod.
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            return HashPassword(password) == storedHash;
        }
    }
}
