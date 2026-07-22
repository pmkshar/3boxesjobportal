import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://3boxesjobportal.vercel.app',
  );

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, String>> _headers({bool isJson = false}) async {
    final token = await _getToken();
    return {
      if (token != null) 'Authorization': 'Bearer $token',
      if (isJson) 'Content-Type': 'application/json',
    };
  }

  // Generic GET request - returns parsed JSON
  static Future<dynamic> _get(String path) async {
    try {
      final headers = await _headers();
      final response = await http.get(
        Uri.parse('$baseUrl$path'),
        headers: headers,
      ).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Generic POST request
  static Future<dynamic> _post(String path, Map<String, dynamic> body) async {
    try {
      final headers = await _headers(isJson: true);
      final response = await http.post(
        Uri.parse('$baseUrl$path'),
        headers: headers,
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // Auth
  static Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 15));
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['token'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', data['token']);
        await prefs.setString('user_data', jsonEncode(data['user']));
        return data;
      }
      return {'error': data['error'] ?? 'Login failed'};
    } catch (e) {
      return {'error': 'Connection error. Please check your internet.'};
    }
  }

  // Helper to extract a list from API response
  static List<dynamic> _extractList(dynamic data, String key) {
    if (data == null) return [];
    if (data is List) return data;
    if (data is Map && data[key] != null) return data[key] as List;
    return [];
  }

  // Jobs
  static Future<List<dynamic>> getJobs({Map<String, String>? queryParams}) async {
    String path = '/api/jobs';
    if (queryParams != null && queryParams.isNotEmpty) {
      final qs = queryParams.entries.map((e) => '${e.key}=${Uri.encodeComponent(e.value)}').join('&');
      path += '?$qs';
    }
    final data = await _get(path);
    return _extractList(data, 'jobs');
  }

  // Single job
  static Future<Map<String, dynamic>?> getJob(String id) async {
    final data = await _get('/api/jobs/$id');
    if (data is Map<String, dynamic>) return data;
    return null;
  }

  // Applications
  static Future<List<dynamic>> getApplications() async {
    final data = await _get('/api/applications');
    return _extractList(data, 'applications');
  }

  static Future<Map<String, dynamic>?> applyToJob(String jobId, {Map<String, dynamic>? extra}) async {
    final data = await _post('/api/applications', {'jobId': jobId, ...?extra});
    if (data is Map<String, dynamic>) return data;
    return null;
  }

  // Analytics
  static Future<Map<String, dynamic>?> getAnalytics({String? userId}) async {
    String path = '/api/analytics';
    if (userId != null) path += '?userId=$userId';
    final data = await _get(path);
    if (data is Map<String, dynamic>) return data;
    return null;
  }

  // Skills
  static Future<List<dynamic>> getSkills() async {
    final data = await _get('/api/skills');
    return _extractList(data, 'skills');
  }

  // Training
  static Future<List<dynamic>> getTraining() async {
    final data = await _get('/api/training');
    return _extractList(data, 'courses');
  }

  // Resumes / CV
  static Future<List<dynamic>> getResumes() async {
    final data = await _get('/api/resumes');
    return _extractList(data, 'resumes');
  }

  // AI Interview
  static Future<Map<String, dynamic>?> startInterview({String? jobId, String? type}) async {
    final data = await _post('/api/ai-interview', {'jobId': jobId, 'type': type});
    if (data is Map<String, dynamic>) return data;
    return null;
  }

  // Notifications
  static Future<List<dynamic>> getNotifications() async {
    final data = await _get('/api/notifications');
    return _extractList(data, 'notifications');
  }

  // Logout
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // Get stored user
  static Future<Map<String, dynamic>?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) return jsonDecode(userData);
    return null;
  }

  // Get stored token
  static Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
}
