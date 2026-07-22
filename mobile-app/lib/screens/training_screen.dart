import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import 'webview_screen.dart';

class TrainingScreen extends StatefulWidget {
  const TrainingScreen({super.key});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen> {
  static const Color _primaryColor = Color(0xFF00C853);
  static const String _marqaicoursesUrl = 'https://marqaicourses.com';

  String _selectedCategory = 'All';
  String _searchQuery = '';
  List<Map<String, dynamic>> _courses = [];
  bool _isLoading = true;

  final List<String> _categories = [
    'All',
    'Programming',
    'Data Science',
    'Soft Skills',
  ];

  // Courses from marqaicourses.com
  final List<Map<String, dynamic>> _marqaiCourses = [
    {
      'id': 'ai-machine-learning',
      'title': 'AI & Machine Learning',
      'category': 'Data Science',
      'level': 'All Levels',
      'rating': 4.9,
      'price': '₹16,616.50',
      'isFree': false,
      'icon': Icons.psychology,
      'color': Color(0xFF2196F3),
      'duration': '40 hours',
      'description': 'Master AI and Machine Learning with step-wise lessons, AI voice tutoring, graded quizzes, and video walkthroughs. Covers neural networks, deep learning, NLP, computer vision, and model deployment.',
      'skills': ['Python', 'TensorFlow', 'Deep Learning', 'NLP'],
    },
    {
      'id': 'fullstack-java-development',
      'title': 'Full Stack Java Development',
      'category': 'Programming',
      'level': 'Intermediate',
      'rating': 4.8,
      'price': '₹14,946.50',
      'isFree': false,
      'icon': Icons.code,
      'color': Color(0xFF009688),
      'duration': '48 hours',
      'description': 'Build end-to-end web applications with Java, Spring Boot, Hibernate, and React. Learn REST API design, microservices architecture, and deployment with AI voice tutoring.',
      'skills': ['Java', 'Spring Boot', 'Microservices', 'React'],
    },
    {
      'id': 'dotnet-fullstack-development',
      'title': '.NET Full Stack Development',
      'category': 'Programming',
      'level': 'Intermediate',
      'rating': 4.8,
      'price': '₹14,946.50',
      'isFree': false,
      'icon': Icons.bar_chart,
      'color': Color(0xFF9C27B0),
      'duration': '45 hours',
      'description': 'Master full-stack development with .NET, C#, ASP.NET Core, and Azure. Build enterprise-grade applications with step-wise lessons and AI voice tutoring.',
      'skills': ['C#', 'ASP.NET Core', 'Azure', 'SQL Server'],
    },
    {
      'id': 'mobile-app-development',
      'title': 'Mobile App Development',
      'category': 'Programming',
      'level': 'Intermediate',
      'rating': 4.7,
      'price': '₹14,111.50',
      'isFree': false,
      'icon': Icons.phone_android,
      'color': Color(0xFFFF9800),
      'duration': '36 hours',
      'description': 'Build cross-platform mobile applications with React Native. Covers iOS & Android deployment, state management, native modules, and app store publishing.',
      'skills': ['React Native', 'TypeScript', 'iOS', 'Android'],
    },
    {
      'id': 'flutter-development',
      'title': 'Flutter Development',
      'category': 'Programming',
      'level': 'All Levels',
      'rating': 4.8,
      'price': '₹13,276.50',
      'isFree': false,
      'icon': Icons.flash_on,
      'color': Color(0xFF00BCD4),
      'duration': '32 hours',
      'description': 'Build beautiful cross-platform apps with Flutter and Dart. Learn state management, REST APIs, native integrations, and deployment with AI voice tutoring.',
      'skills': ['Flutter', 'Dart', 'Firebase', 'REST API'],
    },
    {
      'id': 'python-programming',
      'title': 'Python Programming — Beginner to Advanced',
      'category': 'Programming',
      'level': 'All Levels',
      'rating': 4.9,
      'price': '₹12,441.50',
      'isFree': false,
      'icon': Icons.emoji_events,
      'color': Color(0xFF4CAF50),
      'duration': '35 hours',
      'description': 'Comprehensive Python course from fundamentals to advanced concepts. Covers data structures, OOP, web development with Django/Flask, and automation.',
      'skills': ['Python', 'Django', 'Flask', 'Automation'],
    },
    {
      'id': 'soft-skills-communication',
      'title': 'Soft Skills & Communication',
      'category': 'Soft Skills',
      'level': 'All Levels',
      'rating': 4.8,
      'price': '₹8,266.50',
      'isFree': false,
      'icon': Icons.people,
      'color': Color(0xFFE91E63),
      'duration': '20 hours',
      'description': 'Develop essential workplace communication, leadership, presentation, and collaboration skills. Learn interview techniques and professional networking.',
      'skills': ['Communication', 'Leadership', 'Presentation', 'Networking'],
    },
    {
      'id': '3boxes-developers-curated',
      'title': '3Boxes Developers Curated Course',
      'category': 'Programming',
      'level': 'Intermediate',
      'rating': 4.9,
      'price': 'FREE',
      'isFree': true,
      'icon': Icons.star,
      'color': Color(0xFF00C853),
      'duration': '30 hours',
      'description': 'Exclusive curated course for 3Boxes platform developers. Covers the full tech stack, best practices, deployment workflows, and integration patterns. Free for 3Boxes developers.',
      'skills': ['React', 'Node.js', 'Next.js', 'PostgreSQL'],
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    setState(() => _isLoading = true);
    try {
      final response = await ApiService.getTrainingCourses();
      if (response is List && response.isNotEmpty) {
        setState(() {
          _courses = response.cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        setState(() {
          _courses = _marqaiCourses;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _courses = _marqaiCourses;
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredCourses {
    return _courses.where((course) {
      final matchesCategory = _selectedCategory == 'All' || course['category'] == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          (course['title'] as String).toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (course['description'] as String).toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open $url'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _openMarqAIcourses() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const WebViewScreen(url: _marqaicoursesUrl, title: 'MarqAI Courses'),
      ),
    );
  }

  void _openCourse(Map<String, dynamic> course) {
    // All courses redirect to marqaicourses.com
    _openMarqAIcourses();
  }

  Widget _buildRatingStars(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 1; i <= 5; i++)
          Icon(
            i <= rating.floor() ? Icons.star : i - 0.5 <= rating ? Icons.star_half : Icons.star_border,
            size: 14,
            color: Colors.amber,
          ),
        const SizedBox(width: 4),
        Text(rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    final IconData icon = course['icon'] as IconData? ?? Icons.school;
    final Color color = course['color'] as Color? ?? _primaryColor;
    final bool isFree = course['isFree'] as bool? ?? false;
    final String price = course['price'] as String? ?? '';

    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _openCourse(course),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 32),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course['title'] as String,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.school, size: 13, color: _primaryColor),
                        const SizedBox(width: 3),
                        Text(
                          'MarqAI Courses',
                          style: TextStyle(fontSize: 12, color: _primaryColor, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isFree ? _primaryColor.withOpacity(0.1) : Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isFree ? 'FREE' : price,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isFree ? _primaryColor : Colors.grey[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.schedule, size: 13, color: Colors.grey[500]),
                        const SizedBox(width: 3),
                        Text(course['duration'] as String, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                        const SizedBox(width: 10),
                        _buildRatingStars(course['rating'] as double),
                      ],
                    ),
                    if (course['level'] != null) ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          course['level'] as String,
                          style: TextStyle(fontSize: 10, color: Colors.grey[600], fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _openCourse(course),
                        icon: const Icon(Icons.open_in_browser, size: 14),
                        label: const Text('View on MarqAI Courses'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                          textStyle: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredCourses;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Training', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // MarqAI Courses Banner - opens WebView
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF00C853), Color(0xFF00E676)]),
            ),
            child: InkWell(
              onTap: _openMarqAIcourses,
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.school, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('MarqAI Courses', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        SizedBox(height: 2),
                        Text('AI Voice Tutor · 5+ Languages · Verified Certs', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                    child: const Text('Open', style: TextStyle(color: Color(0xFF00C853), fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ],
              ),
            ),
          ),
          // Search bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Search courses...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
          // Category filter chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: _categories.map((category) {
                  final isSelected = category == _selectedCategory;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(category),
                      selected: isSelected,
                      onSelected: (_) => setState(() => _selectedCategory = category),
                      selectedColor: _primaryColor.withOpacity(0.15),
                      checkmarkColor: _primaryColor,
                      labelStyle: TextStyle(
                        color: isSelected ? _primaryColor : Colors.grey[700],
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(color: isSelected ? _primaryColor : Colors.grey[300]!),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          // Results count
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(
              children: [
                Text('${filtered.length} course${filtered.length != 1 ? 's' : ''} from marqaicourses.com',
                    style: TextStyle(fontSize: 13, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                const Spacer(),
                Text('Powered by MarqAI', style: TextStyle(fontSize: 11, color: _primaryColor, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          // Course list
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: _primaryColor))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.school_outlined, size: 64, color: Colors.grey[300]),
                            const SizedBox(height: 12),
                            Text('No courses found', style: TextStyle(fontSize: 16, color: Colors.grey[500])),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: _openMarqAIcourses,
                              style: ElevatedButton.styleFrom(backgroundColor: _primaryColor),
                              child: const Text('Browse MarqAI Courses', style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: _primaryColor,
                        onRefresh: _loadCourses,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 16),
                          itemCount: filtered.length + 1,
                          itemBuilder: (context, index) {
                            if (index == filtered.length) {
                              // Bottom CTA
                              return Padding(
                                padding: const EdgeInsets.all(16),
                                child: OutlinedButton.icon(
                                  onPressed: _openMarqAIcourses,
                                  icon: const Icon(Icons.open_in_browser, size: 18),
                                  label: const Text('Browse all courses on marqaicourses.com'),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: _primaryColor,
                                    side: const BorderSide(color: _primaryColor),
                                    padding: const EdgeInsets.symmetric(vertical: 12),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              );
                            }
                            return _buildCourseCard(filtered[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
