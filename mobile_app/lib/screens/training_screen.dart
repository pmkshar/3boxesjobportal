import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class TrainingScreen extends StatefulWidget {
  const TrainingScreen({super.key});

  @override
  State<TrainingScreen> createState() => _TrainingScreenState();
}

class _TrainingScreenState extends State<TrainingScreen> {
  List<dynamic> _courses = [];
  bool _loading = true;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  Future<void> _loadCourses() async {
    setState(() => _loading = true);
    final courses = await ApiService.getTraining();
    setState(() {
      _courses = courses;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Training Hub', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Filter tabs
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['all', 'technical', 'soft-skills', 'leadership', 'certification'].map((f) {
                  final isActive = _filter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _filter = f),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isActive ? const Color(0xFF06B6D4) : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          f[0].toUpperCase() + f.substring(1).replaceAll('-', ' '),
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isActive ? Colors.white : const Color(0xFF66789C)),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF06B6D4)))
                : _courses.isEmpty
                    ? _buildDefaultCourses()
                    : RefreshIndicator(
                        onRefresh: _loadCourses,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _courses.length,
                          itemBuilder: (context, index) => _CourseCard(course: _courses[index]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildDefaultCourses() {
    // Built-in courses when API returns empty
    final defaultCourses = [
      {'title': 'Advanced Python Development', 'provider': '3 Boxes Academy', 'duration': '8 weeks', 'level': 'Advanced', 'category': 'technical', 'rating': 4.8, 'enrolled': 1250, 'color': const Color(0xFF059669)},
      {'title': 'Cloud Architecture Fundamentals', 'provider': 'AWS Partner', 'duration': '6 weeks', 'level': 'Intermediate', 'category': 'technical', 'rating': 4.6, 'enrolled': 890, 'color': const Color(0xFF3B82F6)},
      {'title': 'Effective Communication at Work', 'provider': '3 Boxes Academy', 'duration': '4 weeks', 'level': 'Beginner', 'category': 'soft-skills', 'rating': 4.7, 'enrolled': 2100, 'color': const Color(0xFF8B5CF6)},
      {'title': 'Leadership & Team Management', 'provider': 'Harvard Online', 'duration': '10 weeks', 'level': 'Advanced', 'category': 'leadership', 'rating': 4.9, 'enrolled': 760, 'color': const Color(0xFF06B6D4)},
      {'title': 'Data Science with ML', 'provider': 'Google Academy', 'duration': '12 weeks', 'level': 'Intermediate', 'category': 'technical', 'rating': 4.8, 'enrolled': 3200, 'color': const Color(0xFFF59E0B)},
      {'title': 'Project Management Pro', 'provider': 'PMI Certified', 'duration': '8 weeks', 'level': 'Intermediate', 'category': 'certification', 'rating': 4.5, 'enrolled': 1500, 'color': const Color(0xFFEF4444)},
      {'title': 'React & Next.js Mastery', 'provider': '3 Boxes Academy', 'duration': '6 weeks', 'level': 'Intermediate', 'category': 'technical', 'rating': 4.7, 'enrolled': 1800, 'color': const Color(0xFF14B8A6)},
      {'title': 'Interview Success Masterclass', 'provider': '3 Boxes Academy', 'duration': '3 weeks', 'level': 'Beginner', 'category': 'soft-skills', 'rating': 4.9, 'enrolled': 4500, 'color': const Color(0xFF6366F1)},
    ];

    final filtered = _filter == 'all' ? defaultCourses : defaultCourses.where((c) => c['category'] == _filter).toList();

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: filtered.length,
      itemBuilder: (context, index) => _CourseCard(course: filtered[index]),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final Map<String, dynamic> course;

  const _CourseCard({required this.course});

  @override
  Widget build(BuildContext context) {
    final color = course['color'] as Color? ?? const Color(0xFF06B6D4);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE4E8EC)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.school, color: color, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course['title']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF05264E), fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text(course['provider']?.toString() ?? '', style: const TextStyle(fontSize: 12, color: Color(0xFF66789C))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _infoChip(Icons.schedule, course['duration']?.toString() ?? '', color),
              const SizedBox(width: 8),
              _infoChip(Icons.bar_chart, course['level']?.toString() ?? '', color),
              const SizedBox(width: 8),
              _infoChip(Icons.star, '${course['rating'] ?? 4.5}', const Color(0xFFF59E0B)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${course['enrolled'] ?? 0} enrolled', style: const TextStyle(fontSize: 12, color: Color(0xFF66789C))),
              SizedBox(
                height: 34,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                  ),
                  child: const Text('Enroll', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoChip(IconData icon, String text, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 3),
        Text(text, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
