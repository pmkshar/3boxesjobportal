import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FindJobsScreen extends StatefulWidget {
  const FindJobsScreen({super.key});

  @override
  State<FindJobsScreen> createState() => _FindJobsScreenState();
}

class _FindJobsScreenState extends State<FindJobsScreen> {
  List<Map<String, dynamic>> _jobs = [];
  bool _loading = true;
  String _searchQuery = '';
  String _selectedLocation = '';
  final _searchController = TextEditingController();

  /// Normalize API job data into the format the UI expects.
  /// API returns: corporate.companyName, salaryMin/salaryMax, jobType,
  /// skills (comma string), requirements (comma string), isRemote, postedDate
  static Map<String, dynamic> _normalizeJob(Map<String, dynamic> raw) {
    // Company name: nested under corporate
    final corporate = raw['corporate'] as Map<String, dynamic>?;
    final companyName = corporate?['companyName']?.toString() ??
        raw['company']?.toString() ?? 'Unknown Company';

    // Salary
    final salaryMin = raw['salaryMin'];
    final salaryMax = raw['salaryMax'];
    final currency = raw['salaryCurrency']?.toString() ?? 'INR';
    String salaryDisplay;
    if (salaryMin != null && salaryMax != null) {
      final minLakh = (salaryMin as num).toDouble() / 100000;
      final maxLakh = (salaryMax as num).toDouble() / 100000;
      if (currency == 'INR') {
        salaryDisplay = '${minLakh.toStringAsFixed(minLakh % 1 == 0 ? 0 : 1)}L - ${maxLakh.toStringAsFixed(maxLakh % 1 == 0 ? 0 : 1)}L INR';
      } else {
        final minK = (salaryMin as num).toDouble() / 1000;
        final maxK = (salaryMax as num).toDouble() / 1000;
        salaryDisplay = '\$${minK.toStringAsFixed(0)}k - \$${maxK.toStringAsFixed(0)}k';
      }
    } else {
      salaryDisplay = raw['salary']?.toString() ?? 'Not disclosed';
    }

    // Job type
    final jobType = raw['jobType']?.toString() ?? raw['type']?.toString() ?? 'Full-time';
    final typeDisplay = jobType.split('-').map((s) => s[0].toUpperCase() + s.substring(1)).join('-');

    // Skills: handle both comma-separated string and List
    final rawSkills = raw['skills'];
    String skillsStr;
    if (rawSkills is List) {
      skillsStr = rawSkills.map((e) => e.toString()).join(', ');
    } else {
      skillsStr = rawSkills?.toString() ?? '';
    }

    // Requirements: convert comma-separated string to list
    List<String> requirements;
    final rawReq = raw['requirements'];
    if (rawReq is List) {
      requirements = rawReq.map((e) => e.toString()).toList();
    } else if (rawReq is String && rawReq.isNotEmpty) {
      requirements = rawReq.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    } else {
      requirements = [];
    }

    // Description + responsibilities + benefits
    final description = raw['description']?.toString() ?? 'No description available.';
    final responsibilities = raw['responsibilities']?.toString() ?? '';
    final benefits = raw['benefits']?.toString() ?? '';

    String fullDescription = description;
    if (responsibilities.isNotEmpty) {
      fullDescription += '\n\nResponsibilities:\n${responsibilities.split(',').map((s) => '• ${s.trim()}').join('\n')}';
    }
    if (benefits.isNotEmpty) {
      fullDescription += '\n\nBenefits:\n${benefits.split(',').map((s) => '• ${s.trim()}').join('\n')}';
    }

    // Posted date
    String posted;
    final postedDate = raw['postedDate']?.toString() ?? raw['createdAt']?.toString();
    if (postedDate != null && postedDate.isNotEmpty) {
      try {
        final dt = DateTime.parse(postedDate);
        final diff = DateTime.now().difference(dt);
        if (diff.inDays == 0) {
          posted = 'Today';
        } else if (diff.inDays == 1) {
          posted = '1 day ago';
        } else if (diff.inDays < 30) {
          posted = '${diff.inDays} days ago';
        } else {
          posted = '${(diff.inDays / 30).floor()} month(s) ago';
        }
      } catch (_) {
        posted = raw['posted']?.toString() ?? 'Recently';
      }
    } else {
      posted = raw['posted']?.toString() ?? 'Recently';
    }

    // Location
    final location = raw['location']?.toString() ?? 'N/A';

    // Experience
    final expMin = raw['experienceMin'];
    final expMax = raw['experienceMax'];
    String experience = '';
    if (expMin != null && expMax != null) {
      experience = '$expMin-$expMax years';
    }

    return {
      'id': raw['id']?.toString() ?? '',
      'title': raw['title']?.toString() ?? 'Untitled Position',
      'company': companyName,
      'location': location,
      'salary': salaryDisplay,
      'type': typeDisplay,
      'description': fullDescription,
      'requirements': requirements,
      'skills': skillsStr,
      'benefits': benefits,
      'posted': posted,
      'isRemote': raw['isRemote'] == true,
      'experience': experience,
      'openings': raw['openings']?.toString() ?? '',
    };
  }

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    setState(() => _loading = true);
    try {
      final results = await ApiService.getJobs(
        queryParams: _searchQuery.isNotEmpty ? {'search': _searchQuery} : null,
      );
      if (mounted) {
        // Normalize API data to match UI field names
        final normalized = results
            .map<Map<String, dynamic>>((r) => _normalizeJob(Map<String, dynamic>.from(r as Map)))
            .toList();
        setState(() {
          _jobs = normalized;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  void _onSearch() {
    _searchQuery = _searchController.text.trim();
    _loadJobs();
  }

  Color _typeColor(String? type) {
    switch (type?.toUpperCase()) {
      case 'FULL-TIME':
      case 'FULL_TIME': return const Color(0xFF059669);
      case 'PART-TIME':
      case 'PART_TIME': return const Color(0xFF3B82F6);
      case 'CONTRACT': return const Color(0xFFF59E0B);
      case 'INTERNSHIP': return const Color(0xFF8B5CF6);
      case 'REMOTE': return const Color(0xFF06B6D4);
      default: return const Color(0xFF059669);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Find Jobs', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onSubmitted: (_) => _onSearch(),
                    decoration: InputDecoration(
                      hintText: 'Search jobs, skills, companies...',
                      prefixIcon: const Icon(Icons.search, color: Color(0xFF66789C)),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.arrow_forward, color: Color(0xFF059669)),
                        onPressed: _onSearch,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE4E8EC)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE4E8EC)),
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF9FAFB),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Jobs list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                : _jobs.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.work_outline, size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 16),
                            const Text('No jobs found', style: TextStyle(fontSize: 16, color: Color(0xFF66789C))),
                            const SizedBox(height: 8),
                            const Text('Try adjusting your search', style: TextStyle(fontSize: 13, color: Color(0xFF66789C))),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadJobs,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: _jobs.length,
                          itemBuilder: (context, index) {
                            final job = _jobs[index];
                            return _JobCard(job: job, typeColor: _typeColor(job['type']?.toString()));
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  final Map<String, dynamic> job;
  final Color typeColor;

  const _JobCard({required this.job, required this.typeColor});

  @override
  Widget build(BuildContext context) {
    // Skills can be a comma-separated string after normalization
    final skillsStr = job['skills']?.toString() ?? '';
    final skillList = skillsStr.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();

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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  job['title'] ?? 'Untitled',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: typeColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  (job['type'] ?? 'Full-time').toString().replaceAll('_', ' '),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: typeColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.business, size: 14, color: Colors.grey.shade500),
              const SizedBox(width: 4),
              Flexible(child: Text(job['company'] ?? 'Company', style: TextStyle(fontSize: 13, color: Colors.grey.shade600), overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 16),
              Icon(Icons.location_on, size: 14, color: Colors.grey.shade500),
              const SizedBox(width: 4),
              Flexible(child: Text(job['location'] ?? 'Remote', style: TextStyle(fontSize: 13, color: Colors.grey.shade600), overflow: TextOverflow.ellipsis)),
            ],
          ),
          const SizedBox(height: 8),
          if (job['salary'] != null && (job['salary'] as String).isNotEmpty)
            Text(
              job['salary'].toString(),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF059669)),
            ),
          if (job['experience'] != null && (job['experience'] as String).isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              'Experience: ${job['experience']}',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
          if (job['description'] != null) ...[
            const SizedBox(height: 8),
            Text(
              job['description'].toString().split('\n').first,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            ),
          ],
          if (skillList.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: skillList.take(4).map((skill) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  skill,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: Color(0xFF059669)),
                ),
              )).toList(),
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 38,
            child: ElevatedButton(
              onPressed: () => _showJobDetail(context, job),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 0,
              ),
              child: const Text('View Details & Apply', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  void _showJobDetail(BuildContext context, Map<String, dynamic> job) {
    final requirements = job['requirements'];
    final requirementsList = requirements is List ? requirements : <String>[];
    final skillsStr = job['skills']?.toString() ?? '';
    final skillList = skillsStr.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    final benefitsStr = job['benefits']?.toString() ?? '';
    final benefitList = benefitsStr.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.88,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(job['title'] ?? 'Job Detail', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 8),
                    // Company & Location
                    Row(
                      children: [
                        Icon(Icons.business, size: 16, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Flexible(child: Text(job['company'] ?? '', style: TextStyle(color: Colors.grey.shade600), overflow: TextOverflow.ellipsis)),
                        const SizedBox(width: 16),
                        Icon(Icons.location_on, size: 16, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Flexible(child: Text(job['location'] ?? '', style: TextStyle(color: Colors.grey.shade600), overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Info chips
                    Wrap(
                      spacing: 10,
                      runSpacing: 8,
                      children: [
                        if (job['salary'] != null && (job['salary'] as String).isNotEmpty)
                          _infoChip(Icons.attach_money, job['salary'].toString()),
                        if (job['type'] != null)
                          _infoChip(Icons.work_outline, job['type'].toString()),
                        if (job['posted'] != null)
                          _infoChip(Icons.access_time, job['posted'].toString()),
                        if (job['experience'] != null && (job['experience'] as String).isNotEmpty)
                          _infoChip(Icons.timeline, job['experience'].toString()),
                        if (job['openings'] != null && (job['openings'] as String).isNotEmpty)
                          _infoChip(Icons.group_outlined, '${job['openings']} openings'),
                        if (job['isRemote'] == true)
                          _infoChip(Icons.wifi, 'Remote'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Description
                    const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE4E8EC)),
                      ),
                      child: Text(job['description'] ?? 'No description available', style: const TextStyle(fontSize: 14, color: Color(0xFF66789C), height: 1.5)),
                    ),
                    // Requirements
                    if (requirementsList.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const Text('Requirements', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                      const SizedBox(height: 8),
                      ...requirementsList.map((req) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check_circle, size: 18, color: Color(0xFF059669)),
                            const SizedBox(width: 8),
                            Expanded(child: Text(req.toString(), style: const TextStyle(fontSize: 13, color: Color(0xFF66789C), height: 1.4))),
                          ],
                        ),
                      )),
                    ],
                    // Key Skills
                    if (skillList.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const Text('Key Skills', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: skillList.map((skill) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(skill, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF059669))),
                        )).toList(),
                      ),
                    ],
                    // Benefits
                    if (benefitList.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const Text('Benefits', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: benefitList.map((benefit) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF3E0),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.card_giftcard, size: 13, color: Color(0xFFE65100)),
                              const SizedBox(width: 4),
                              Text(benefit, style: const TextStyle(fontSize: 11, color: Color(0xFFE65100), fontWeight: FontWeight.w500)),
                            ],
                          ),
                        )).toList(),
                      ),
                    ],
                    const SizedBox(height: 28),
                    // Apply button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () async {
                          final result = await ApiService.applyToJob(job['id']?.toString() ?? '');
                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(result != null ? 'Application submitted!' : 'Application submitted! (Demo mode)'),
                                backgroundColor: const Color(0xFF059669),
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Apply Now', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: const Color(0xFF66789C)),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF05264E), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
