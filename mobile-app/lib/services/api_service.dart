import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String _defaultBaseUrl = 'https://3boxesjobportal.vercel.app';
  static String baseUrl = const String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: _defaultBaseUrl,
  );

  static String? _token;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  static Future<void> saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }

  static Future<void> saveUserData(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(data));
  }

  static Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString('user_data');
    if (data != null) {
      return jsonDecode(data);
    }
    return null;
  }

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  // Auth
  static Future<Map<String, dynamic>> login(String email, String password, {String role = 'candidate'}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password, 'role': role}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 && data['token'] != null) {
      await saveToken(data['token']);
      await saveUserData(data['user'] ?? {});
    }
    return data;
  }

  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: _headers,
      body: jsonEncode(userData),
    );
    return jsonDecode(response.body);
  }

  // Generic GET
  static Future<dynamic> _get(String endpoint, {Map<String, String>? queryParams}) async {
    final uri = Uri.parse('$baseUrl$endpoint').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: _headers);
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return {'error': 'Request failed', 'statusCode': response.statusCode};
  }

  // Generic POST
  static Future<Map<String, dynamic>> _post(String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return jsonDecode(response.body);
  }

  // Extract list from response
  static List<dynamic> _extractList(dynamic response) {
    if (response is List) return response;
    if (response is Map) {
      if (response['data'] is List) return response['data'];
      if (response['jobs'] is List) return response['jobs'];
      if (response['applications'] is List) return response['applications'];
      if (response['results'] is List) return response['results'];
    }
    return [];
  }

  // Jobs
  static Future<List<dynamic>> getJobs({Map<String, String>? queryParams}) async {
    final response = await _get('/api/jobs', queryParams: queryParams);
    return _extractList(response);
  }

  static Future<Map<String, dynamic>> getJob(String id) async {
    return await _get('/api/jobs/$id');
  }

  // Applications
  static Future<List<dynamic>> getApplications() async {
    final response = await _get('/api/applications');
    return _extractList(response);
  }

  static Future<Map<String, dynamic>> applyToJob(String jobId, {Map<String, dynamic>? extra}) async {
    return await _post('/api/applications', {'jobId': jobId, ...?extra});
  }

  // Skills
  static Future<List<dynamic>> getSkills() async {
    final response = await _get('/api/skills');
    return _extractList(response);
  }

  // Training
  static Future<List<dynamic>> getTrainingCourses() async {
    final response = await _get('/api/training');
    return _extractList(response);
  }

  // Resumes / CV
  static Future<List<dynamic>> getResumes() async {
    final response = await _get('/api/resumes');
    return _extractList(response);
  }

  static Future<Map<String, dynamic>> createResume(Map<String, dynamic> data) async {
    return await _post('/api/resumes', data);
  }

  // Analytics
  static Future<Map<String, dynamic>> getAnalytics() async {
    return await _get('/api/analytics');
  }

  // AI Interview
  static Future<Map<String, dynamic>> startInterview({String type = 'behavioral'}) async {
    return await _post('/api/interviews/start', {'type': type});
  }

  static Future<Map<String, dynamic>> submitInterviewAnswer(String interviewId, String answer) async {
    return await _post('/api/interviews/$interviewId/answer', {'answer': answer});
  }

  // AI Buddy
  static Future<Map<String, dynamic>> sendBuddyMessage(String message, {String? sessionId}) async {
    return await _post('/api/ai-buddy/chat', {'message': message, if (sessionId != null) 'sessionId': sessionId});
  }

  // Skill Gap
  static Future<Map<String, dynamic>> analyzeSkillGap({String? targetJob}) async {
    return await _post('/api/skills/gap-analysis', {if (targetJob != null) 'targetJob': targetJob});
  }

  // Job Fit
  static Future<Map<String, dynamic>> evaluateJobFit(String jobId) async {
    return await _post('/api/jobs/$jobId/fit-evaluation', {});
  }

  // Profile
  static Future<Map<String, dynamic>> getProfile() async {
    return await _get('/api/profile');
  }

  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/api/profile'),
      headers: _headers,
      body: jsonEncode(data),
    );
    return jsonDecode(response.body);
  }

  // Company / Corp
  static Future<List<dynamic>> getCompanyJobs() async {
    final response = await _get('/api/company/jobs');
    return _extractList(response);
  }

  static Future<List<dynamic>> getCompanyApplications() async {
    final response = await _get('/api/company/applications');
    return _extractList(response);
  }

  // Find Candidates
  static Future<List<dynamic>> findCandidates({Map<String, String>? queryParams}) async {
    final response = await _get('/api/candidates', queryParams: queryParams);
    return _extractList(response);
  }
}
