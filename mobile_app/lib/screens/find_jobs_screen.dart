import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FindJobsScreen extends StatefulWidget {
  const FindJobsScreen({super.key});

  @override
  State<FindJobsScreen> createState() => _FindJobsScreenState();
}

class _FindJobsScreenState extends State<FindJobsScreen> {
  List<dynamic> _jobs = [];
  bool _loading = true;
  String _searchQuery = '';
  String _selectedLocation = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    setState(() => _loading = true);
    final jobs = await ApiService.getJobs(
      queryParams: _searchQuery.isNotEmpty ? {'search': _searchQuery} : null,
    );
    setState(() {
      _jobs = jobs;
      _loading = false;
    });
  }

  void _onSearch() {
    _searchQuery = _searchController.text.trim();
    _loadJobs();
  }

  Color _typeColor(String? type) {
    switch (type?.toUpperCase()) {
      case 'FULL_TIME': return const Color(0xFF059669);
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
              Text(job['company'] ?? 'Company', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
              const SizedBox(width: 16),
              Icon(Icons.location_on, size: 14, color: Colors.grey.shade500),
              const SizedBox(width: 4),
              Text(job['location'] ?? 'Remote', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
            ],
          ),
          const SizedBox(height: 8),
          if (job['salary'] != null)
            Text(
              job['salary'].toString(),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF059669)),
            ),
          if (job['description'] != null) ...[
            const SizedBox(height: 8),
            Text(
              job['description'].toString(),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            ),
          ],
          if (job['skills'] != null && job['skills'] is List && (job['skills'] as List).isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: (job['skills'] as List).take(4).map((skill) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  skill.toString(),
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
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
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
                    Text(job['title'] ?? 'Job Detail', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.business, size: 16, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(job['company'] ?? '', style: TextStyle(color: Colors.grey.shade600)),
                        const SizedBox(width: 16),
                        Icon(Icons.location_on, size: 16, color: Colors.grey.shade500),
                        const SizedBox(width: 4),
                        Text(job['location'] ?? '', style: TextStyle(color: Colors.grey.shade600)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (job['salary'] != null) ...[
                      _detailRow('Salary', job['salary'].toString()),
                      const SizedBox(height: 8),
                    ],
                    _detailRow('Type', (job['type'] ?? 'N/A').toString().replaceAll('_', ' ')),
                    const SizedBox(height: 16),
                    const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                    const SizedBox(height: 8),
                    Text(job['description'] ?? 'No description available', style: const TextStyle(fontSize: 14, color: Color(0xFF66789C), height: 1.5)),
                    if (job['requirements'] != null) ...[
                      const SizedBox(height: 16),
                      const Text('Requirements', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
                      const SizedBox(height: 8),
                      Text(job['requirements'].toString(), style: const TextStyle(fontSize: 14, color: Color(0xFF66789C), height: 1.5)),
                    ],
                    const SizedBox(height: 24),
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
                                content: Text(result != null ? 'Application submitted!' : 'Failed to apply. Try again.'),
                                backgroundColor: result != null ? const Color(0xFF059669) : Colors.red,
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

  Widget _detailRow(String label, String value) {
    return Row(
      children: [
        SizedBox(width: 80, child: Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF66789C)))),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF05264E))),
      ],
    );
  }
}
