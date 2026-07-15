import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TrainingScreen extends StatefulWidget {
  const TrainingScreen({super.key});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen> {
  static const Color _primaryColor = Color(0xFF00C853);

  String _selectedCategory = 'All';
  String _searchQuery = '';
  List<Map<String, dynamic>> _courses = [];
  bool _isLoading = true;
  String? _error;

  final List<String> _categories = [
    'All',
    'Development',
    'Design',
    'Marketing',
    'Data Science',
    'Business',
  ];

  // Demo data
  final List<Map<String, dynamic>> _demoCourses = [
    {
      'id': '1',
      'title': 'Full-Stack Web Development',
      'provider': 'TechAcademy',
      'category': 'Development',
      'duration': '12 weeks',
      'rating': 4.8,
      'price': 149.99,
      'isFree': false,
      'icon': Icons.code,
      'color': Color(0xFF2196F3),
    },
    {
      'id': '2',
      'title': 'UI/UX Design Masterclass',
      'provider': 'DesignHub Pro',
      'category': 'Design',
      'duration': '8 weeks',
      'rating': 4.6,
      'price': 0,
      'isFree': true,
      'icon': Icons.palette,
      'color': Color(0xFFE91E63),
    },
    {
      'id': '3',
      'title': 'Digital Marketing Strategy',
      'provider': 'MarketGenius',
      'category': 'Marketing',
      'duration': '6 weeks',
      'rating': 4.3,
      'price': 79.99,
      'isFree': false,
      'icon': Icons.campaign,
      'color': Color(0xFFFF9800),
    },
    {
      'id': '4',
      'title': 'Data Science with Python',
      'provider': 'DataLearn Institute',
      'category': 'Data Science',
      'duration': '10 weeks',
      'rating': 4.9,
      'price': 199.99,
      'isFree': false,
      'icon': Icons.analytics,
      'color': Color(0xFF9C27B0),
    },
    {
      'id': '5',
      'title': 'Business Analytics Fundamentals',
      'provider': 'BizSchool Online',
      'category': 'Business',
      'duration': '5 weeks',
      'rating': 4.4,
      'price': 0,
      'isFree': true,
      'icon': Icons.business_center,
      'color': Color(0xFF607D8B),
    },
    {
      'id': '6',
      'title': 'Mobile App Development with Flutter',
      'provider': 'CodeCraft Academy',
      'category': 'Development',
      'duration': '9 weeks',
      'rating': 4.7,
      'price': 129.99,
      'isFree': false,
      'icon': Icons.phone_android,
      'color': Color(0xFF00BCD4),
    },
    {
      'id': '7',
      'title': 'Graphic Design for Beginners',
      'provider': 'CreativeLab',
      'category': 'Design',
      'duration': '4 weeks',
      'rating': 4.2,
      'price': 49.99,
      'isFree': false,
      'icon': Icons.brush,
      'color': Color(0xFFFF5722),
    },
    {
      'id': '8',
      'title': 'Machine Learning A-Z',
      'provider': 'AI Academy',
      'category': 'Data Science',
      'duration': '14 weeks',
      'rating': 4.8,
      'price': 249.99,
      'isFree': false,
      'icon': Icons.psychology,
      'color': Color(0xFF3F51B5),
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiService.getTrainingCourses();
      if (response is List && response.isNotEmpty) {
        setState(() {
          _courses = response.cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      } else {
        // Use demo data when API returns empty or error
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
      final matchesCategory =
          _selectedCategory == 'All' || course['category'] == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          (course['title'] as String)
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()) ||
          (course['provider'] as String)
              .toLowerCase()
              .contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  Widget _buildRatingStars(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (int i = 1; i <= 5; i++)
          Icon(
            i <= rating.floor()
                ? Icons.star
                : i - 0.5 <= rating
                    ? Icons.star_half
                    : Icons.star_border,
            size: 16,
            color: Colors.amber,
          ),
        const SizedBox(width: 4),
        Text(
          rating.toStringAsFixed(1),
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    final bool isFree = course['isFree'] as bool? ?? false;
    final double? price = course['price'] as double?;
    final IconData icon = course['icon'] as IconData? ?? Icons.school;
    final Color color = course['color'] as Color? ?? _primaryColor;

    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          _showCourseDetail(course);
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Course image placeholder
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
              // Course details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            course['title'] as String,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isFree)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _primaryColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'FREE',
                              style: TextStyle(
                                color: _primaryColor,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        else
                          Text(
                            '\$${price?.toStringAsFixed(2) ?? '0.00'}',
                            style: const TextStyle(
                              color: _primaryColor,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      course['provider'] as String,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.schedule, size: 14, color: Colors.grey[500]),
                        const SizedBox(width: 4),
                        Text(
                          course['duration'] as String,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(width: 12),
                        _buildRatingStars(course['rating'] as double),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => _enrollCourse(course),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          isFree ? 'Enroll Now' : 'Register',
                          style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w600),
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

  void _enrollCourse(Map<String, dynamic> course) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Enrolled in "${course['title']}" successfully!',
        ),
        backgroundColor: _primaryColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showCourseDetail(Map<String, dynamic> course) {
    final bool isFree = course['isFree'] as bool? ?? false;
    final double? price = course['price'] as double?;
    final IconData icon = course['icon'] as IconData? ?? Icons.school;
    final Color color = course['color'] as Color? ?? _primaryColor;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.85,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Icon(icon, color: color, size: 48),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                course['title'] as String,
                style: const TextStyle(
                    fontSize: 22, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'by ${course['provider']}',
                  style: TextStyle(fontSize: 15, color: Colors.grey[600]),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _infoChip(Icons.category, course['category'] as String),
                  const SizedBox(width: 8),
                  _infoChip(Icons.schedule, course['duration'] as String),
                  const SizedBox(width: 8),
                  _infoChip(
                    isFree ? Icons.check_circle : Icons.attach_money,
                    isFree ? 'Free' : '\$${price?.toStringAsFixed(2)}',
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Center(child: _buildRatingStars(course['rating'] as double)),
              const SizedBox(height: 24),
              const Text(
                'Course Overview',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Comprehensive course covering all essential topics in ${course['category']}. '
                'Learn from industry experts with hands-on projects and real-world applications. '
                'Includes video lectures, assignments, and a certificate upon completion.',
                style: TextStyle(fontSize: 14, color: Colors.grey[700], height: 1.5),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _enrollCourse(course);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    isFree ? 'Enroll Now - Free' : 'Register - \$${price?.toStringAsFixed(2)}',
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey[700]),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[700])),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredCourses;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Training',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            color: _primaryColor,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: TextField(
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Search courses...',
                hintStyle: TextStyle(color: Colors.white60),
                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                filled: true,
                fillColor: Colors.white.withOpacity(0.2),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
              style: const TextStyle(color: Colors.white),
            ),
          ),
          // Category filter chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
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
                      onSelected: (_) =>
                          setState(() => _selectedCategory = category),
                      selectedColor: _primaryColor.withOpacity(0.15),
                      checkmarkColor: _primaryColor,
                      labelStyle: TextStyle(
                        color: isSelected ? _primaryColor : Colors.grey[700],
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                      ),
                      side: BorderSide(
                        color: isSelected
                            ? _primaryColor
                            : Colors.grey[300]!,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          // Results count
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: [
                Text(
                  '${filtered.length} course${filtered.length != 1 ? 's' : ''} found',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          // Course list
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: _primaryColor))
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error_outline,
                                size: 48, color: Colors.grey[400]),
                            const SizedBox(height: 12),
                            Text(_error!,
                                style: TextStyle(color: Colors.grey[600])),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: _loadCourses,
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: _primaryColor),
                              child: const Text('Retry',
                                  style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      )
                    : filtered.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.school_outlined,
                                    size: 64, color: Colors.grey[300]),
                                const SizedBox(height: 12),
                                Text(
                                  'No courses found',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[500],
                                  ),
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
                              itemBuilder: (context, index) =>
                                  _buildCourseCard(filtered[index]),
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
