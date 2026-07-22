import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'main_navigation.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _error;
  bool _obscurePassword = true;

  // Base URL for the API - update this to your deployed URL
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://3boxesjobportal.vercel.app',
  );

  Future<void> _login() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() => _error = 'Please enter email and password');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['token'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['token']);
        await prefs.setString('user_data', jsonEncode(data['user']));

        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const MainNavigation()),
          );
        }
      } else {
        setState(() {
          _error = data['error'] ?? 'Login failed. Please try again.';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Connection error. Please check your internet connection.';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              // Logo
              Center(
                child: CustomPaint(
                  size: const Size(80, 56),
                  painter: _MiniLogoPainter(),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  '3 Boxes Jobs',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF05264E),
                  ),
                ),
              ),
              const Center(
                child: Text(
                  'AI-Powered Career Platform',
                  style: TextStyle(fontSize: 14, color: Color(0xFF66789C)),
                ),
              ),
              const SizedBox(height: 40),

              // Error message
              if (_error != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(_error!, style: TextStyle(color: Colors.red.shade700, fontSize: 13)),
                ),

              // Email field
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email',
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE4E8EC)),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Password field
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE4E8EC)),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Login button
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 2,
                  ),
                  child: _isLoading
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 16),

              // Demo accounts info
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFD1FAE5)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Demo Accounts:', style: TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF059669), fontSize: 13)),
                    SizedBox(height: 4),
                    Text('Job Seeker: seeker@3boxes.com / password123', style: TextStyle(fontSize: 11, color: Color(0xFF66789C))),
                    Text('Corporate: corp@3boxes.com / password123', style: TextStyle(fontSize: 11, color: Color(0xFF66789C))),
                    Text('Admin: admin@3boxes.com / password123', style: TextStyle(fontSize: 11, color: Color(0xFF66789C))),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 60;
    // Simplified 3 boxes for login
    final paints = [
      [const Color(0xFF4ADE80), const Color(0xFF16A34A)],
      [const Color(0xFF34D399), const Color(0xFF059669)],
      [const Color(0xFF86EFAC), const Color(0xFF16A34A)],
    ];
    final offsets = [
      [Offset(2 * s, 11 * s), Offset(14 * s, 8 * s), Offset(14 * s, 25 * s), Offset(2 * s, 28 * s)],
      [Offset(10 * s, 7 * s), Offset(22 * s, 4 * s), Offset(22 * s, 21 * s), Offset(10 * s, 24 * s)],
      [Offset(18 * s, 13 * s), Offset(30 * s, 10 * s), Offset(30 * s, 27 * s), Offset(18 * s, 30 * s)],
    ];
    for (int i = 0; i < 3; i++) {
      final path = Path()
        ..moveTo(offsets[i][0].dx, offsets[i][0].dy)
        ..lineTo(offsets[i][1].dx, offsets[i][1].dy)
        ..lineTo(offsets[i][2].dx, offsets[i][2].dy)
        ..lineTo(offsets[i][3].dx, offsets[i][3].dy)
        ..close();
      canvas.drawPath(path, Paint()..color = paints[i][0]);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
