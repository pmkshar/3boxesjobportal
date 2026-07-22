import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FindJobsScreen extends StatefulWidget {
  const FindJobsScreen({super.key});

  @override
  State<FindJobsScreen> createState() => _FindJobsScreenState();
}

class _FindJobsScreenState extends State<FindJobsScreen> {
  static const Color _primaryColor = Color(0xFF00C853);

  final TextEditingController _searchController = TextEditingController();
  String _selectedLocation = 'All';
  List<Map<String, dynamic>> _jobs = [];
  bool _isLoading = true;
  bool _isRefreshing = false;

  final List<String> _locations = [
    'All',
    'Remote',
    'Bangalore, India',
    'Hyderabad, India',
    'Pune, India',
    'Mumbai, India',
    'Chennai, India',
  ];

  // Fallback demo data
  static final List<Map<String, dynamic>> _demoJobs = [
    {
      'id': '1',
      'title': 'Senior Flutter Developer',
      'company': 'TechCorp Inc.',
      'location': 'Remote',
      'salary': '\$120k - \$160k',
      'type': 'Full-time',
      'tags': ['Remote', 'Full-time'],
      'description':
          'We are looking for an experienced Flutter developer to join our mobile team. You will be responsible for building and maintaining high-quality mobile applications for both iOS and Android platforms.',
      'requirements': [
        '5+ years of mobile development experience',
        '3+ years of Flutter/Dart experience',
        'Strong understanding of state management (Bloc/Riverpod)',
        'Experience with REST APIs and GraphQL',
        'Familiarity with CI/CD pipelines',
      ],
      'posted': '2 days ago',
    },
    {
      'id': '2',
      'title': 'Full-Stack Engineer',
      'company': 'InnovateLab',
      'location': 'San Francisco, CA',
      'salary': '\$130k - \$175k',
      'type': 'Full-time',
      'tags': ['Full-time', 'Urgent'],
      'description':
          'Join our core engineering team to build scalable web applications. You will work across the entire stack from frontend React to backend Node.js microservices.',
      'requirements': [
        '4+ years full-stack experience',
        'React/Next.js and Node.js proficiency',
        'PostgreSQL and Redis knowledge',
        'Docker and Kubernetes experience',
        'Strong communication skills',
      ],
      'posted': '1 day ago',
    },
    {
      'id': '3',
      'title': 'UX/UI Designer',
      'company': 'DesignStudio Pro',
      'location': 'New York, NY',
      'salary': '\$95k - \$130k',
      'type': 'Full-time',
      'tags': ['Full-time'],
      'description':
          'Create beautiful, intuitive user experiences for our suite of SaaS products. Work closely with product managers and engineers to ship world-class designs.',
      'requirements': [
        '3+ years UX/UI design experience',
        'Figma expert-level proficiency',
        'Design systems experience',
        'User research and usability testing skills',
        'Portfolio demonstrating end-to-end design process',
      ],
      'posted': '3 days ago',
    },
    {
      'id': '4',
      'title': 'Data Scientist',
      'company': 'DataDriven Co.',
      'location': 'Austin, TX',
      'salary': '\$110k - \$150k',
      'type': 'Full-time',
      'tags': ['Remote', 'Full-time'],
      'description':
          'Leverage machine learning and statistical analysis to drive product insights and business decisions. Work with petabyte-scale datasets.',
      'requirements': [
        'MS/PhD in Computer Science, Statistics, or related field',
        'Python, TensorFlow/PyTorch proficiency',
        'SQL and BigQuery experience',
        'Statistical modeling and ML expertise',
        'Strong presentation skills',
      ],
      'posted': '5 days ago',
    },
    {
      'id': '5',
      'title': 'DevOps Engineer',
      'company': 'CloudScale Systems',
      'location': 'Seattle, WA',
      'salary': '\$125k - \$165k',
      'type': 'Full-time',
      'tags': ['Urgent'],
      'description':
          'Build and maintain our cloud infrastructure on AWS. Automate deployments, monitor system health, and ensure 99.99% uptime for our platform.',
      'requirements': [
        '5+ years DevOps/SRE experience',
        'AWS/GCP certification preferred',
        'Terraform, Ansible, and Docker expertise',
        'Kubernetes administration',
        'Incident management and on-call experience',
      ],
      'posted': '1 day ago',
    },
    {
      'id': '6',
      'title': 'Product Manager',
      'company': 'GrowthVentures',
      'location': 'London, UK',
      'salary': '\$100k - \$140k',
      'type': 'Full-time',
      'tags': ['Remote'],
      'description':
          'Lead product strategy and execution for our B2B platform. Define roadmaps, prioritize features, and collaborate with cross-functional teams to deliver impactful products.',
      'requirements': [
        '4+ years product management experience',
        'B2B SaaS product background',
        'Data-driven decision making',
        'Agile/Scrum methodology expertise',
        'Excellent stakeholder management skills',
      ],
      'posted': '4 days ago',
    },
  ];

  /// Transform API job data into the format the UI expects.
  /// API fields: corporate.companyName, salaryMin/salaryMax, jobType,
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

    // Tags: build from isRemote + jobType + skills
    final isRemote = raw['isRemote'] == true;
    final tags = <String>[];
    if (isRemote) tags.add('Remote');
    tags.add(typeDisplay);

    // Skills as tags (show first few)
    final skillsStr = raw['skills']?.toString() ?? '';
    if (skillsStr.isNotEmpty) {
      final skillList = skillsStr.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      for (int i = 0; i < skillList.length && i < 3; i++) {
        if (!tags.contains(skillList[i])) {
          tags.add(skillList[i]);
        }
      }
    }

    // Requirements: convert comma-separated string to list
    List<String> requirements;
    final rawReq = raw['requirements'];
    if (rawReq is List) {
      requirements = rawReq.map((e) => e.toString()).toList();
    } else if (rawReq is String && rawReq.isNotEmpty) {
      requirements = rawReq.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    } else {
      requirements = (raw['requirements'] as List<dynamic>?)?.cast<String>() ?? [];
    }

    // Description
    final description = raw['description']?.toString() ?? 'No description available.';

    // Responsibilities
    final responsibilities = raw['responsibilities']?.toString() ?? '';
    final benefits = raw['benefits']?.toString() ?? '';

    // Build full description with responsibilities and benefits
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
      'tags': tags,
      'description': fullDescription,
      'requirements': requirements,
      'posted': posted,
      'isRemote': isRemote,
      'experience': experience,
      'skills': skillsStr,
      'benefits': benefits,
      'openings': raw['openings']?.toString() ?? '',
    };
  }

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadJobs() async {
    setState(() => _isLoading = true);
    try {
      final queryParams = <String, String>{};
      if (_searchController.text.isNotEmpty) {
        queryParams['search'] = _searchController.text;
      }
      if (_selectedLocation != 'All') {
        queryParams['location'] = _selectedLocation;
      }

      final results = await ApiService.getJobs(queryParams: queryParams);
      if (mounted) {
        if (results.isNotEmpty) {
          // Normalize API data to match UI format
          final normalized = results
              .map<Map<String, dynamic>>((r) => _normalizeJob(Map<String, dynamic>.from(r as Map)))
              .toList();
          setState(() {
            _jobs = normalized;
            _isLoading = false;
          });
        } else {
          setState(() {
            _jobs = List.from(_demoJobs);
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _jobs = List.from(_demoJobs);
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _refreshJobs() async {
    setState(() => _isRefreshing = true);
    try {
      final queryParams = <String, String>{};
      if (_searchController.text.isNotEmpty) {
        queryParams['search'] = _searchController.text;
      }
      if (_selectedLocation != 'All') {
        queryParams['location'] = _selectedLocation;
      }

      final results = await ApiService.getJobs(queryParams: queryParams);
      if (mounted) {
        if (results.isNotEmpty) {
          final normalized = results
              .map<Map<String, dynamic>>((r) => _normalizeJob(Map<String, dynamic>.from(r as Map)))
              .toList();
          setState(() {
            _jobs = normalized;
            _isRefreshing = false;
          });
        } else {
          setState(() {
            _jobs = List.from(_demoJobs);
            _isRefreshing = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _jobs = List.from(_demoJobs);
          _isRefreshing = false;
        });
      }
    }
  }

  void _showJobDetails(Map<String, dynamic> job) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
            controller: scrollController,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Drag handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                // Title
                Text(
                  job['title'] ?? 'Untitled Position',
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  job['company'] ?? 'Unknown Company',
                  style: TextStyle(fontSize: 15, color: Colors.grey[700], fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                // Info chips
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: [
                    _detailChip(Icons.location_on_outlined, job['location'] ?? 'N/A'),
                    _detailChip(Icons.attach_money, job['salary'] ?? 'Not disclosed'),
                    _detailChip(Icons.access_time, job['posted'] ?? 'N/A'),
                    _detailChip(Icons.work_outline, job['type'] ?? 'N/A'),
                    if (job['experience'] != null && (job['experience'] as String).isNotEmpty)
                      _detailChip(Icons.timeline, job['experience']),
                    if (job['openings'] != null && (job['openings'] as String).isNotEmpty)
                      _detailChip(Icons.group_outlined, '${job['openings']} openings'),
                  ],
                ),
                const SizedBox(height: 16),
                // Tags
                if ((job['tags'] as List<dynamic>?) != null && (job['tags'] as List).isNotEmpty)
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: (job['tags'] as List).map((tag) {
                      Color bgColor, textColor;
                      if (tag == 'Remote') {
                        bgColor = const Color(0xFFE8F5E9);
                        textColor = const Color(0xFF2E7D32);
                      } else if (tag == 'Urgent') {
                        bgColor = const Color(0xFFFFEBEE);
                        textColor = const Color(0xFFC62828);
                      } else if (tag == 'Full-time' || tag == 'Part-time') {
                        bgColor = const Color(0xFFE3F2FD);
                        textColor = const Color(0xFF1565C0);
                      } else {
                        bgColor = const Color(0xFFF3E5F5);
                        textColor = const Color(0xFF7B1FA2);
                      }
                      return Chip(
                        label: Text(tag.toString()),
                        backgroundColor: bgColor,
                        labelStyle: TextStyle(color: textColor, fontWeight: FontWeight.w600, fontSize: 12),
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      );
                    }).toList(),
                  ),
                const SizedBox(height: 24),
                // Description
                const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Text(
                    job['description'] ?? 'No description available.',
                    style: TextStyle(fontSize: 14, color: Colors.grey[800], height: 1.6),
                  ),
                ),
                const SizedBox(height: 24),
                // Requirements
                if ((job['requirements'] as List<dynamic>?) != null && (job['requirements'] as List).isNotEmpty) ...[
                  const Text('Requirements', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  ...(job['requirements'] as List).map((req) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check_circle, size: 20, color: _primaryColor),
                        const SizedBox(width: 10),
                        Expanded(child: Text(req.toString(), style: TextStyle(fontSize: 14, color: Colors.grey[700]))),
                      ],
                    ),
                  )),
                ],
                // Skills
                if (job['skills'] != null && (job['skills'] as String).isNotEmpty) ...[
                  const SizedBox(height: 24),
                  const Text('Key Skills', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: (job['skills'] as String)
                        .split(',')
                        .map((s) => s.trim())
                        .where((s) => s.isNotEmpty)
                        .map((skill) => Chip(
                              label: Text(skill, style: const TextStyle(fontSize: 12)),
                              backgroundColor: _primaryColor.withOpacity(0.08),
                              labelStyle: TextStyle(color: _primaryColor, fontWeight: FontWeight.w500, fontSize: 12),
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ))
                        .toList(),
                  ),
                ],
                // Benefits
                if (job['benefits'] != null && (job['benefits'] as String).isNotEmpty) ...[
                  const SizedBox(height: 24),
                  const Text('Benefits', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: (job['benefits'] as String)
                        .split(',')
                        .map((s) => s.trim())
                        .where((s) => s.isNotEmpty)
                        .map((benefit) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF3E0),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.card_giftcard, size: 14, color: Color(0xFFE65100)),
                                  const SizedBox(width: 4),
                                  Text(benefit, style: const TextStyle(fontSize: 12, color: Color(0xFFE65100), fontWeight: FontWeight.w500)),
                                ],
                              ),
                            ))
                        .toList(),
                  ),
                ],
                const SizedBox(height: 32),
                // Apply button
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _applyToJob(job);
                    },
                    style: FilledButton.styleFrom(
                      backgroundColor: _primaryColor,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Apply Now', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _applyToJob(Map<String, dynamic> job) async {
    try {
      final jobId = job['id']?.toString() ?? '';
      await ApiService.applyToJob(jobId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Applied to ${job['title']}!'),
            backgroundColor: _primaryColor,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Application submitted for ${job['title']}! (Demo mode)'),
            backgroundColor: _primaryColor,
          ),
        );
      }
    }
  }

  Widget _detailChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[700], fontWeight: FontWeight.w500)),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      colorSchemeSeed: _primaryColor,
      useMaterial3: true,
    );

    return Theme(
      data: theme,
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F7FA),
        appBar: AppBar(
          title: const Text(
            'Find Jobs',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: _primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        body: Column(
          children: [
            // Search & Filter Bar
            Container(
              color: _primaryColor,
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
              child: Column(
                children: [
                  // Search bar
                  TextField(
                    controller: _searchController,
                    onSubmitted: (_) => _loadJobs(),
                    decoration: InputDecoration(
                      hintText: 'Search jobs, companies...',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.send, color: _primaryColor),
                        onPressed: _loadJobs,
                      ),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Location filter
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedLocation,
                        isExpanded: true,
                        icon: const Icon(Icons.location_on, color: _primaryColor),
                        items: _locations.map((loc) {
                          return DropdownMenuItem(
                            value: loc,
                            child: Text(loc),
                          );
                        }).toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() => _selectedLocation = value);
                            _loadJobs();
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Job List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: _primaryColor))
                  : _jobs.isEmpty
                      ? _buildEmptyState()
                      : RefreshIndicator(
                          color: _primaryColor,
                          onRefresh: _refreshJobs,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _jobs.length,
                            itemBuilder: (context, index) {
                              return _buildJobCard(_jobs[index]);
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.work_outline, size: 80, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text(
              'No jobs found',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              'Try adjusting your search or location filter',
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () {
                _searchController.clear();
                setState(() => _selectedLocation = 'All');
                _loadJobs();
              },
              style: FilledButton.styleFrom(
                backgroundColor: _primaryColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Clear Filters'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobCard(Map<String, dynamic> job) {
    final tags = (job['tags'] as List<dynamic>?)?.cast<String>() ?? <String>[];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        onTap: () => _showJobDetails(job),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title row
              Row(
                children: [
                  Expanded(
                    child: Text(
                      job['title'] ?? 'Untitled Position',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  if (tags.contains('Urgent'))
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFEBEE),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Urgent',
                        style: TextStyle(color: Color(0xFFC62828), fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                  const SizedBox(width: 4),
                  const Icon(Icons.chevron_right, color: Colors.grey),
                ],
              ),
              const SizedBox(height: 4),
              // Company
              Text(
                job['company'] ?? 'Unknown Company',
                style: TextStyle(fontSize: 14, color: Colors.grey[700], fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 10),
              // Location & salary
              Row(
                children: [
                  Icon(Icons.location_on_outlined, size: 15, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Flexible(child: Text(job['location'] ?? 'N/A', style: TextStyle(fontSize: 12, color: Colors.grey[500]), overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 16),
                  Icon(Icons.attach_money, size: 15, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Flexible(child: Text(job['salary'] ?? 'Not disclosed', style: TextStyle(fontSize: 12, color: Colors.grey[500]), overflow: TextOverflow.ellipsis)),
                ],
              ),
              const SizedBox(height: 10),
              // Tags
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: tags.where((t) => t != 'Urgent').map((tag) {
                  Color bgColor;
                  Color textColor;
                  if (tag == 'Remote') {
                    bgColor = const Color(0xFFE8F5E9);
                    textColor = const Color(0xFF2E7D32);
                  } else if (tag == 'Full-time' || tag == 'Part-time') {
                    bgColor = const Color(0xFFE3F2FD);
                    textColor = const Color(0xFF1565C0);
                  } else {
                    bgColor = const Color(0xFFF3E5F5);
                    textColor = const Color(0xFF7B1FA2);
                  }
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
                    child: Text(tag, style: TextStyle(color: textColor, fontSize: 11, fontWeight: FontWeight.w600)),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              // Tap to expand hint
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text('Tap to view details', style: TextStyle(fontSize: 11, color: Colors.grey[400], fontStyle: FontStyle.italic)),
                  const SizedBox(width: 4),
                  Icon(Icons.touch_app, size: 14, color: Colors.grey[400]),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
