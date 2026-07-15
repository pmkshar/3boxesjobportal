import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ApplicationsTrackerScreen extends StatefulWidget {
  const ApplicationsTrackerScreen({super.key});

  @override
  State<ApplicationsTrackerScreen> createState() =>
      _ApplicationsTrackerScreenState();
}

class _ApplicationsTrackerScreenState extends State<ApplicationsTrackerScreen>
    with SingleTickerProviderStateMixin {
  static const Color _primaryColor = Color(0xFF00C853);

  late TabController _tabController;
  List<Map<String, dynamic>> _applications = [];
  bool _isLoading = true;

  final List<_StatusTab> _tabs = [
    _StatusTab(key: 'all', label: 'All', icon: Icons.list),
    _StatusTab(key: 'applied', label: 'Applied', icon: Icons.send),
    _StatusTab(key: 'interview', label: 'Interview', icon: Icons.people),
    _StatusTab(key: 'offer', label: 'Offer', icon: Icons.card_giftcard),
    _StatusTab(key: 'rejected', label: 'Rejected', icon: Icons.cancel),
  ];

  // Demo data with 5 applications in various states
  static final List<Map<String, dynamic>> _demoApplications = [
    {
      'id': '1',
      'jobTitle': 'Senior Flutter Developer',
      'company': 'TechCorp Inc.',
      'location': 'Remote',
      'appliedDate': '2024-01-15',
      'currentStatus': 'interview',
      'statusHistory': [
        {'status': 'applied', 'date': '2024-01-15', 'note': 'Application submitted'},
        {'status': 'interview', 'date': '2024-01-22', 'note': 'Phone screen scheduled for Jan 25'},
      ],
      'salary': '\$120k - \$160k',
    },
    {
      'id': '2',
      'jobTitle': 'Full-Stack Engineer',
      'company': 'InnovateLab',
      'location': 'San Francisco, CA',
      'appliedDate': '2024-01-10',
      'currentStatus': 'offer',
      'statusHistory': [
        {'status': 'applied', 'date': '2024-01-10', 'note': 'Application submitted'},
        {'status': 'interview', 'date': '2024-01-18', 'note': 'Technical interview completed'},
        {'status': 'offer', 'date': '2024-01-28', 'note': 'Offer received: \$145k base + equity'},
      ],
      'salary': '\$130k - \$175k',
    },
    {
      'id': '3',
      'jobTitle': 'UX/UI Designer',
      'company': 'DesignStudio Pro',
      'location': 'New York, NY',
      'appliedDate': '2024-01-20',
      'currentStatus': 'applied',
      'statusHistory': [
        {'status': 'applied', 'date': '2024-01-20', 'note': 'Application submitted'},
      ],
      'salary': '\$95k - \$130k',
    },
    {
      'id': '4',
      'jobTitle': 'Data Scientist',
      'company': 'DataDriven Co.',
      'location': 'Austin, TX',
      'appliedDate': '2024-01-05',
      'currentStatus': 'rejected',
      'statusHistory': [
        {'status': 'applied', 'date': '2024-01-05', 'note': 'Application submitted'},
        {'status': 'interview', 'date': '2024-01-12', 'note': 'First round interview'},
        {'status': 'rejected', 'date': '2024-01-19', 'note': 'Position filled by another candidate'},
      ],
      'salary': '\$110k - \$150k',
    },
    {
      'id': '5',
      'jobTitle': 'Product Manager',
      'company': 'GrowthVentures',
      'location': 'London, UK',
      'appliedDate': '2024-01-18',
      'currentStatus': 'interview',
      'statusHistory': [
        {'status': 'applied', 'date': '2024-01-18', 'note': 'Application submitted'},
        {'status': 'interview', 'date': '2024-01-25', 'note': 'Case study round on Feb 1'},
      ],
      'salary': '\$100k - \$140k',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) return;
      setState(() {});
    });
    _loadApplications();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadApplications() async {
    setState(() => _isLoading = true);
    try {
      final results = await ApiService.getApplications();
      if (mounted) {
        setState(() {
          _applications = results.cast<Map<String, dynamic>>();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _applications = List.from(_demoApplications);
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> _getFilteredApplications() {
    final selectedKey = _tabs[_tabController.index].key;
    if (selectedKey == 'all') return _applications;
    return _applications
        .where((app) =>
            (app['currentStatus'] as String?)?.toLowerCase() == selectedKey)
        .toList();
  }

  // ── Statistics ─────────────────────────────────────────────────────
  int get _totalCount => _applications.length;
  double get _interviewRate {
    if (_totalCount == 0) return 0;
    final interviewCount = _applications
        .where((a) =>
            (a['currentStatus'] as String?) == 'interview' ||
            (a['currentStatus'] as String?) == 'offer')
        .length;
    return (interviewCount / _totalCount) * 100;
  }

  double get _offerRate {
    if (_totalCount == 0) return 0;
    final offerCount = _applications
        .where((a) => (a['currentStatus'] as String?) == 'offer')
        .length;
    return (offerCount / _totalCount) * 100;
  }

  // ── Status helpers ─────────────────────────────────────────────────
  static Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'applied':
        return const Color(0xFF1565C0);
      case 'interview':
        return const Color(0xFFF57F17);
      case 'offer':
        return const Color(0xFF00C853);
      case 'rejected':
        return const Color(0xFFC62828);
      default:
        return Colors.grey;
    }
  }

  static Color _getStatusBgColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'applied':
        return const Color(0xFFE3F2FD);
      case 'interview':
        return const Color(0xFFFFF8E1);
      case 'offer':
        return const Color(0xFFE8F5E9);
      case 'rejected':
        return const Color(0xFFFFEBEE);
      default:
        return Colors.grey[100]!;
    }
  }

  static String _getStatusLabel(String? status) {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'Applied';
      case 'interview':
        return 'Interview';
      case 'offer':
        return 'Offer';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  static IconData _getStatusIcon(String? status) {
    switch (status?.toLowerCase()) {
      case 'applied':
        return Icons.send;
      case 'interview':
        return Icons.people;
      case 'offer':
        return Icons.card_giftcard;
      case 'rejected':
        return Icons.cancel;
      default:
        return Icons.help_outline;
    }
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
            'Applications',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: _primaryColor,
          foregroundColor: Colors.white,
          elevation: 0,
          bottom: TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: Colors.white,
            indicatorWeight: 3,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            labelStyle: const TextStyle(fontWeight: FontWeight.w600),
            tabs: _tabs
                .map((tab) => Tab(
                      icon: Icon(tab.icon, size: 18),
                      text: tab.label,
                    ))
                .toList(),
          ),
        ),
        body: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: _primaryColor))
            : Column(
                children: [
                  // Statistics chips
                  _buildStatisticsChips(),
                  // Applications list
                  Expanded(
                    child: _buildApplicationsList(),
                  ),
                ],
              ),
      ),
    );
  }

  // ── Statistics Chips ───────────────────────────────────────────────
  Widget _buildStatisticsChips() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          _buildStatChip(
            icon: Icons.work_outline,
            label: 'Total',
            value: '$_totalCount',
            color: const Color(0xFF1565C0),
          ),
          const SizedBox(width: 10),
          _buildStatChip(
            icon: Icons.people_outline,
            label: 'Interview Rate',
            value: '${_interviewRate.toStringAsFixed(0)}%',
            color: const Color(0xFFF57F17),
          ),
          const SizedBox(width: 10),
          _buildStatChip(
            icon: Icons.card_giftcard,
            label: 'Offer Rate',
            value: '${_offerRate.toStringAsFixed(0)}%',
            color: _primaryColor,
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: color.withOpacity(0.8),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Applications List ──────────────────────────────────────────────
  Widget _buildApplicationsList() {
    final filtered = _getFilteredApplications();

    if (filtered.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      color: _primaryColor,
      onRefresh: _loadApplications,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          return _buildApplicationCard(filtered[index]);
        },
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
            Icon(Icons.inbox_outlined, size: 80, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text(
              'No applications yet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Start applying to jobs and track your progress here',
              style: TextStyle(fontSize: 14, color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  // ── Application Card ───────────────────────────────────────────────
  Widget _buildApplicationCard(Map<String, dynamic> app) {
    final currentStatus = app['currentStatus'] as String?;
    final statusHistory =
        (app['statusHistory'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ??
            [];

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: InkWell(
        onTap: () => _showApplicationDetails(app),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title row with status badge
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      app['jobTitle'] ?? 'Unknown Position',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildStatusBadge(currentStatus),
                ],
              ),
              const SizedBox(height: 4),
              // Company & location
              Row(
                children: [
                  Text(
                    app['company'] ?? 'Unknown Company',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Icon(Icons.location_on_outlined,
                      size: 13, color: Colors.grey[500]),
                  const SizedBox(width: 2),
                  Text(
                    app['location'] ?? 'N/A',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              // Date
              Row(
                children: [
                  Icon(Icons.calendar_today_outlined,
                      size: 13, color: Colors.grey[400]),
                  const SizedBox(width: 4),
                  Text(
                    'Applied: ${_formatDate(app['appliedDate'])}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                  ),
                  if (app['salary'] != null) ...[
                    const SizedBox(width: 12),
                    Icon(Icons.attach_money, size: 13, color: Colors.grey[400]),
                    Text(
                      app['salary'],
                      style: TextStyle(fontSize: 12, color: Colors.grey[400]),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 14),
              // Timeline visualization
              if (statusHistory.isNotEmpty)
                _buildTimeline(statusHistory, currentStatus),
            ],
          ),
        ),
      ),
    );
  }

  // ── Status Badge ───────────────────────────────────────────────────
  Widget _buildStatusBadge(String? status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _getStatusBgColor(status),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_getStatusIcon(status), size: 12,
              color: _getStatusColor(status)),
          const SizedBox(width: 4),
          Text(
            _getStatusLabel(status),
            style: TextStyle(
              color: _getStatusColor(status),
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  // ── Timeline Visualization ─────────────────────────────────────────
  Widget _buildTimeline(
      List<Map<String, dynamic>> history, String? currentStatus) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Timeline',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Colors.grey[500],
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            for (int i = 0; i < history.length; i++) ...[
              _buildTimelineNode(history[i], i == history.length - 1),
              if (i < history.length - 1)
                Expanded(
                  child: Container(
                    height: 3,
                    decoration: BoxDecoration(
                      color: _primaryColor.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
            ],
          ],
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: history
              .map((h) => Text(
                    _formatDate(h['date']),
                    style: TextStyle(fontSize: 9, color: Colors.grey[400]),
                  ))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildTimelineNode(Map<String, dynamic> entry, bool isLatest) {
    final status = entry['status'] as String?;
    final color = _getStatusColor(status);

    return Column(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isLatest ? color : color.withOpacity(0.2),
            border: Border.all(
              color: color,
              width: 2,
            ),
          ),
          child: Icon(
            _getStatusIcon(status),
            size: 13,
            color: isLatest ? Colors.white : color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          _getStatusLabel(status),
          style: TextStyle(
            fontSize: 9,
            fontWeight: isLatest ? FontWeight.w700 : FontWeight.w500,
            color: isLatest ? color : Colors.grey[600],
          ),
        ),
      ],
    );
  }

  // ── Application Details Bottom Sheet ───────────────────────────────
  void _showApplicationDetails(Map<String, dynamic> app) {
    final statusHistory =
        (app['statusHistory'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ??
            [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Title & status
                    Text(
                      app['jobTitle'] ?? 'Unknown Position',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      app['company'] ?? 'Unknown Company',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[700],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildStatusBadge(app['currentStatus']),
                    const SizedBox(height: 20),
                    // Details
                    _detailRow(Icons.location_on_outlined, 'Location',
                        app['location'] ?? 'N/A'),
                    _detailRow(Icons.attach_money, 'Salary',
                        app['salary'] ?? 'Not disclosed'),
                    _detailRow(Icons.calendar_today_outlined, 'Applied On',
                        _formatDate(app['appliedDate'])),
                    const SizedBox(height: 20),
                    // Full timeline
                    const Text(
                      'Application Timeline',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...statusHistory.asMap().entries.map((entry) {
                      final isLast = entry.key == statusHistory.length - 1;
                      return _buildFullTimelineItem(
                        entry.value,
                        isLast,
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFullTimelineItem(Map<String, dynamic> entry, bool isLast) {
    final status = entry['status'] as String?;
    final color = _getStatusColor(status);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline line + dot
          SizedBox(
            width: 40,
            child: Column(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: color.withOpacity(0.15),
                    border: Border.all(color: color, width: 2),
                  ),
                  child: Icon(_getStatusIcon(status), size: 12, color: color),
                ),
                if (!isLast)
                  Expanded(
                    child: Container(
                      width: 2,
                      color: Colors.grey[300],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getStatusLabel(status),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _formatDate(entry['date']),
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                  if (entry['note'] != null &&
                      (entry['note'] as String).isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      entry['note'],
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[500]),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(dynamic dateStr) {
    if (dateStr == null) return 'N/A';
    try {
      final date = DateTime.parse(dateStr.toString());
      final months = [
        '',
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
      return '${months[date.month]} ${date.day}, ${date.year}';
    } catch (e) {
      return dateStr.toString();
    }
  }
}

class _StatusTab {
  final String key;
  final String label;
  final IconData icon;

  _StatusTab({
    required this.key,
    required this.label,
    required this.icon,
  });
}
