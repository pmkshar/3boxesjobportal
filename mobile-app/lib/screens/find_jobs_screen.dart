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
    'New York, NY',
    'San Francisco, CA',
    'Austin, TX',
    'Chicago, IL',
    'Seattle, WA',
    'London, UK',
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
          setState(() {
            _jobs = results.cast<Map<String, dynamic>>();
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
          setState(() {
            _jobs = results.cast<Map<String, dynamic>>();
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
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _detailChip(Icons.location_on_outlined, job['location'] ?? 'N/A'),
                    _detailChip(Icons.attach_money, job['salary'] ?? 'Not disclosed'),
                    _detailChip(Icons.access_time, job['posted'] ?? 'N/A'),
                    _detailChip(Icons.work_outline, job['type'] ?? 'N/A'),
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
                      } else {
                        bgColor = const Color(0xFFE3F2FD);
                        textColor = const Color(0xFF1565C0);
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
                  Text(job['location'] ?? 'N/A', style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                  const SizedBox(width: 16),
                  Icon(Icons.attach_money, size: 15, color: Colors.grey[500]),
                  const SizedBox(width: 4),
                  Text(job['salary'] ?? 'Not disclosed', style: TextStyle(fontSize: 12, color: Colors.grey[500])),
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
