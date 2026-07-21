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
  static const String _marqaTrainersUrl = 'https://marqaitrainers.vercel.app';

  String _selectedCategory = 'All';
  String _searchQuery = '';
  List<Map<String, dynamic>> _courses = [];
  bool _isLoading = true;

  final List<String> _categories = [
    'All',
    'Development',
    'Design',
    'Marketing',
    'Data Science',
    'Business',
  ];

  // Demo data with Marqa Trainers linked courses
  final List<Map<String, dynamic>> _demoCourses = [
    {
      'id': '1',
      'title': 'Full-Stack Web Development',
      'provider': 'Marqa Trainers',
      'category': 'Development',
      'duration': '12 weeks',
      'rating': 4.8,
      'price': 0,
      'isFree': true,
      'icon': Icons.code,
      'color': Color(0xFF2196F3),
      'url': '$_marqaTrainersUrl/courses/full-stack-web-development',
      'description': 'Master full-stack development with hands-on projects covering React, Node.js, databases, and deployment.',
    },
    {
      'id': '2',
      'title': 'UI/UX Design Masterclass',
      'provider': 'Marqa Trainers',
      'category': 'Design',
      'duration': '8 weeks',
      'rating': 4.6,
      'price': 0,
      'isFree': true,
      'icon': Icons.palette,
      'color': Color(0xFFE91E63),
      'url': '$_marqaTrainersUrl/courses/ui-ux-design',
      'description': 'Learn user-centered design principles, Figma, prototyping, and design systems from industry experts.',
    },
    {
      'id': '3',
      'title': 'Digital Marketing Strategy',
      'provider': 'Marqa Trainers',
      'category': 'Marketing',
      'duration': '6 weeks',
      'rating': 4.3,
      'price': 0,
      'isFree': true,
      'icon': Icons.campaign,
      'color': Color(0xFFFF9800),
      'url': '$_marqaTrainersUrl/courses/digital-marketing',
      'description': 'Comprehensive digital marketing covering SEO, SEM, social media, content marketing, and analytics.',
    },
    {
      'id': '4',
      'title': 'Data Science with Python',
      'provider': 'Marqa Trainers',
      'category': 'Data Science',
      'duration': '10 weeks',
      'rating': 4.9,
      'price': 0,
      'isFree': true,
      'icon': Icons.analytics,
      'color': Color(0xFF9C27B0),
      'url': '$_marqaTrainersUrl/courses/data-science-python',
      'description': 'Learn data analysis, machine learning, and visualization using Python, Pandas, and Scikit-learn.',
    },
    {
      'id': '5',
      'title': 'Business Analytics Fundamentals',
      'provider': 'Marqa Trainers',
      'category': 'Business',
      'duration': '5 weeks',
      'rating': 4.4,
      'price': 0,
      'isFree': true,
      'icon': Icons.business_center,
      'color': Color(0xFF607D8B),
      'url': '$_marqaTrainersUrl/courses/business-analytics',
      'description': 'Learn business intelligence, KPI frameworks, and data-driven decision making.',
    },
    {
      'id': '6',
      'title': 'Mobile App Development with Flutter',
      'provider': 'Marqa Trainers',
      'category': 'Development',
      'duration': '9 weeks',
      'rating': 4.7,
      'price': 0,
      'isFree': true,
      'icon': Icons.phone_android,
      'color': Color(0xFF00BCD4),
      'url': '$_marqaTrainersUrl/courses/flutter-development',
      'description': 'Build cross-platform mobile apps with Flutter and Dart. Covers state management, APIs, and deployment.',
    },
    {
      'id': '7',
      'title': 'Graphic Design for Beginners',
      'provider': 'Marqa Trainers',
      'category': 'Design',
      'duration': '4 weeks',
      'rating': 4.2,
      'price': 0,
      'isFree': true,
      'icon': Icons.brush,
      'color': Color(0xFFFF5722),
      'url': '$_marqaTrainersUrl/courses/graphic-design',
      'description': 'Master the fundamentals of graphic design including typography, color theory, and layout principles.',
    },
    {
      'id': '8',
      'title': 'Machine Learning A-Z',
      'provider': 'Marqa Trainers',
      'category': 'Data Science',
      'duration': '14 weeks',
      'rating': 4.8,
      'price': 0,
      'isFree': true,
      'icon': Icons.psychology,
      'color': Color(0xFF3F51B5),
      'url': '$_marqaTrainersUrl/courses/machine-learning',
      'description': 'Complete machine learning course covering supervised/unsupervised learning, deep learning, and NLP.',
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
          _courses = _demoCourses;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _courses = _demoCourses;
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filteredCourses {
    return _courses.where((course) {
      final matchesCategory = _selectedCategory == 'All' || course['category'] == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          (course['title'] as String).toLowerCase().contains(_searchQuery.toLowerCase()) ||
          (course['provider'] as String).toLowerCase().contains(_searchQuery.toLowerCase());
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

  void _openCourse(Map<String, dynamic> course) {
    final url = course['url'] as String? ?? _marqaTrainersUrl;
    // Open in WebView within the app
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => WebViewScreen(url: url, title: course['title'] as String? ?? 'Course'),
      ),
    );
  }

  void _openMarqaTrainers() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const WebViewScreen(url: _marqaTrainersUrl, title: 'Marqa Trainers'),
      ),
    );
  }

  Widget _buildRatingStars(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 1; i <= 5; i++)
          Icon(
            i <= rating.floor() ? Icons.star : i - 0.5 <= rating ? Icons.star_half : Icons.star_border,
            size: 16,
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
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 36),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course['title'] as String, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.school, size: 14, color: _primaryColor),
                        const SizedBox(width: 4),
                        Text(course['provider'] as String, style: TextStyle(fontSize: 13, color: _primaryColor, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.schedule, size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(course['duration'] as String, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                        const SizedBox(width: 12),
                        _buildRatingStars(course['rating'] as double),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _openCourse(course),
                        icon: const Icon(Icons.open_in_browser, size: 16),
                        label: const Text('Open Course'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
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
          // Marqa Trainers Banner - opens WebView
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF00C853), Color(0xFF00E676)]),
            ),
            child: InkWell(
              onTap: _openMarqaTrainers,
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
                        Text('Marqa Trainers', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        SizedBox(height: 2),
                        Text('Browse all courses & certifications', style: TextStyle(color: Colors.white70, fontSize: 13)),
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
                Text('${filtered.length} course${filtered.length != 1 ? 's' : ''} found',
                    style: TextStyle(fontSize: 13, color: Colors.grey[600], fontWeight: FontWeight.w500)),
                const Spacer(),
                Text('Powered by Marqa Trainers', style: TextStyle(fontSize: 11, color: _primaryColor, fontWeight: FontWeight.w600)),
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
                              onPressed: _openMarqaTrainers,
                              style: ElevatedButton.styleFrom(backgroundColor: _primaryColor),
                              child: const Text('Browse Marqa Trainers', style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: _primaryColor,
                        onRefresh: _loadCourses,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 16),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) => _buildCourseCard(filtered[index]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
