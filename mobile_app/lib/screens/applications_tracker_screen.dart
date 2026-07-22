import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class ApplicationsTrackerScreen extends StatefulWidget {
  const ApplicationsTrackerScreen({super.key});

  @override
  State<ApplicationsTrackerScreen> createState() => _ApplicationsTrackerScreenState();
}

class _ApplicationsTrackerScreenState extends State<ApplicationsTrackerScreen> {
  List<dynamic> _applications = [];
  bool _loading = true;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadApplications();
  }

  Future<void> _loadApplications() async {
    setState(() => _loading = true);
    final apps = await ApiService.getApplications();
    setState(() {
      _applications = apps;
      _loading = false;
    });
  }

  List<dynamic> get _filteredApps {
    if (_filter == 'all') return _applications;
    return _applications.where((app) => (app['status'] ?? '').toString().toLowerCase() == _filter).toList();
  }

  int _countByStatus(String status) {
    return _applications.where((app) => (app['status'] ?? '').toString().toLowerCase() == status).length;
  }

  Color _statusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'applied': return const Color(0xFF3B82F6);
      case 'reviewed': return const Color(0xFFF59E0B);
      case 'shortlisted': return const Color(0xFF8B5CF6);
      case 'interview': return const Color(0xFF06B6D4);
      case 'offered': return const Color(0xFF059669);
      case 'rejected': return const Color(0xFFEF4444);
      default: return const Color(0xFF66789C);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredApps;
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: const Text('Applications', style: TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Summary stats
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                _statChip('All', _applications.length, const Color(0xFF05264E)),
                const SizedBox(width: 8),
                _statChip('Applied', _countByStatus('applied'), const Color(0xFF3B82F6)),
                const SizedBox(width: 8),
                _statChip('Shortlisted', _countByStatus('shortlisted'), const Color(0xFF8B5CF6)),
                const SizedBox(width: 8),
                _statChip('Offered', _countByStatus('offered'), const Color(0xFF059669)),
              ],
            ),
          ),
          // Filter tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['all', 'applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'].map((f) {
                  final isActive = _filter == f;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _filter = f),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: isActive ? const Color(0xFF10B981) : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          f[0].toUpperCase() + f.substring(1),
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
          // Application list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.assignment_outlined, size: 64, color: Colors.grey.shade300),
                            const SizedBox(height: 16),
                            const Text('No applications yet', style: TextStyle(fontSize: 16, color: Color(0xFF66789C))),
                            const SizedBox(height: 8),
                            const Text('Start applying to jobs to track your progress', style: TextStyle(fontSize: 13, color: Color(0xFF66789C))),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadApplications,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) => _ApplicationCard(
                            application: filtered[index],
                            statusColor: _statusColor(filtered[index]['status']?.toString()),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _statChip(String label, int count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text('$count', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: color)),
          ],
        ),
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  final Map<String, dynamic> application;
  final Color statusColor;

  const _ApplicationCard({required this.application, required this.statusColor});

  @override
  Widget build(BuildContext context) {
    final job = application['job'] ?? application;
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
                  job['title'] ?? application['jobTitle'] ?? 'Untitled',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF05264E)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  (application['status'] ?? 'Applied').toString().toUpperCase(),
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.business, size: 14, color: Colors.grey.shade500),
              const SizedBox(width: 4),
              Text(job['company'] ?? application['company'] ?? '', style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
            ],
          ),
          if (application['appliedAt'] != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(Icons.schedule, size: 14, color: Colors.grey.shade500),
                const SizedBox(width: 4),
                Text('Applied: ${application['appliedAt']}', style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
              ],
            ),
          ],
          // Timeline indicator
          const SizedBox(height: 12),
          Row(
            children: [
              _timelineDot(true, 'Applied'),
              _timelineLine(application['status'] != 'applied'),
              _timelineDot(application['status'] != 'applied', 'Reviewed'),
              _timelineLine(['shortlisted', 'interview', 'offered'].contains(application['status']?.toLowerCase())),
              _timelineDot(['shortlisted', 'interview', 'offered'].contains(application['status']?.toLowerCase()), 'Shortlisted'),
              _timelineLine(application['status']?.toLowerCase() == 'offered'),
              _timelineDot(application['status']?.toLowerCase() == 'offered', 'Offered'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _timelineDot(bool active, String label) {
    return Column(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            color: active ? const Color(0xFF10B981) : const Color(0xFFE4E8EC),
            shape: BoxShape.circle,
          ),
          child: active ? const Icon(Icons.check, color: Colors.white, size: 12) : null,
        ),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 8, color: active ? const Color(0xFF10B981) : const Color(0xFF66789C))),
      ],
    );
  }

  Widget _timelineLine(bool active) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        color: active ? const Color(0xFF10B981) : const Color(0xFFE4E8EC),
      ),
    );
  }
}
