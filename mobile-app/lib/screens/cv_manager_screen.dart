import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'resume_builder_screen.dart';

class CvManagerScreen extends StatefulWidget {
  const CvManagerScreen({super.key});

  @override
  State<CvManagerScreen> createState() => _CvManagerScreenState();
}

class _CvManagerScreenState extends State<CvManagerScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _resumes = [];
  bool _isLoading = true;

  // Demo resumes for offline mode
  static const List<Map<String, dynamic>> _demoResumes = [
    {
      'id': '1',
      'name': 'Software Engineer CV',
      'lastModified': '2025-02-20',
      'templateType': 'Professional',
    },
    {
      'id': '2',
      'name': 'Creative Portfolio Resume',
      'lastModified': '2025-02-15',
      'templateType': 'Creative',
    },
    {
      'id': '3',
      'name': 'Data Analyst Resume',
      'lastModified': '2025-01-30',
      'templateType': 'Technical',
    },
  ];

  static const List<Map<String, String>> _templates = [
    {
      'name': 'Professional',
      'description':
          'Clean, corporate layout ideal for traditional industries. Features structured sections with a focus on experience and achievements.',
      'icon': 'business_center',
    },
    {
      'name': 'Creative',
      'description':
          'Modern, visually engaging design with accent colors and custom sections. Perfect for design, marketing, and media roles.',
      'icon': 'palette',
    },
    {
      'name': 'Technical',
      'description':
          'Skills-forward layout emphasizing technical competencies, projects, and certifications. Built for engineering and IT professionals.',
      'icon': 'code',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadResumes();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadResumes() async {
    setState(() => _isLoading = true);
    try {
      final data = await ApiService.getResumes();
      if (data.isNotEmpty) {
        setState(() {
          _resumes = data.map<Map<String, dynamic>>((r) => Map<String, dynamic>.from(r)).toList();
          _isLoading = false;
        });
      } else {
        setState(() {
          _resumes = List<Map<String, dynamic>>.from(_demoResumes);
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() {
        _resumes = List<Map<String, dynamic>>.from(_demoResumes);
        _isLoading = false;
      });
    }
  }

  IconData _templateIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'professional':
        return Icons.business_center_outlined;
      case 'creative':
        return Icons.palette_outlined;
      case 'technical':
        return Icons.code_outlined;
      default:
        return Icons.description_outlined;
    }
  }

  Color _templateColor(String? type) {
    switch (type?.toLowerCase()) {
      case 'professional':
        return const Color(0xFF00C853);
      case 'creative':
        return Colors.deepPurple;
      case 'technical':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  void _navigateToBuilder(String templateName) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ResumeBuilderScreen(template: templateName),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const primaryGreen = Color(0xFF00C853);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text('CV Manager'),
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'My Resumes', icon: Icon(Icons.folder_outlined)),
            Tab(text: 'AI Builder', icon: Icon(Icons.auto_awesome)),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildResumesTab(theme, primaryGreen),
          _buildTemplatesTab(theme, primaryGreen),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          _tabController.animateTo(1);
        },
        backgroundColor: primaryGreen,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Resume'),
      ),
    );
  }

  // ── Resumes Tab ──────────────────────────────────────────────────
  Widget _buildResumesTab(ThemeData theme, Color primaryGreen) {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator(color: primaryGreen));
    }

    if (_resumes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.description_outlined, size: 72, color: Colors.grey[300]),
            const SizedBox(height: 16),
            Text('No resumes yet', style: theme.textTheme.titleMedium?.copyWith(color: Colors.grey)),
            const SizedBox(height: 8),
            Text('Tap + to create your first resume',
                style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: primaryGreen,
      onRefresh: _loadResumes,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
        itemCount: _resumes.length,
        itemBuilder: (context, index) {
          final resume = _resumes[index];
          final color = _templateColor(resume['templateType'] as String?);

          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                _showResumeDetail(resume);
              },
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(_templateIcon(resume['templateType'] as String?), color: color, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            resume['name'] ?? 'Untitled',
                            style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.calendar_today_outlined, size: 14, color: Colors.grey[500]),
                              const SizedBox(width: 4),
                              Text(
                                resume['lastModified'] ?? 'Unknown',
                                style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: color.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  resume['templateType'] ?? 'N/A',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: color,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'delete') {
                          _showDeleteDialog(resume);
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(value: 'edit', child: Text('Edit')),
                        PopupMenuItem(value: 'duplicate', child: Text('Duplicate')),
                        PopupMenuItem(value: 'delete', child: Text('Delete')),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // ── Resume Detail ────────────────────────────────────────────────
  void _showResumeDetail(Map<String, dynamic> resume) {
    final color = _templateColor(resume['templateType'] as String?);

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => _ResumeDetailPage(
          resume: resume,
          color: color,
          icon: _templateIcon(resume['templateType'] as String?),
          onEdit: () {
            Navigator.pop(context);
            _navigateToBuilder(resume['templateType'] ?? 'Professional');
          },
          onDelete: () {
            Navigator.pop(context);
            _showDeleteDialog(resume);
          },
        ),
      ),
    );
  }

  // ── AI Builder Tab ───────────────────────────────────────────────
  Widget _buildTemplatesTab(ThemeData theme, Color primaryGreen) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00C853), Color(0xFF00E676)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              const Icon(Icons.auto_awesome, color: Colors.white, size: 32),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('AI Resume Builder',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        )),
                    const SizedBox(height: 4),
                    Text(
                      'Choose a template and let AI craft your perfect resume',
                      style: theme.textTheme.bodySmall?.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Text('Select a Template', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        ..._templates.map((t) => _buildTemplateCard(theme, primaryGreen, t)),
      ],
    );
  }

  Widget _buildTemplateCard(ThemeData theme, Color primaryGreen, Map<String, String> template) {
    final color = _templateColor(template['name']);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _templateIcon(template['name']),
                    color: color,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    template['name']!,
                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              template['description']!,
              style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey[700], height: 1.5),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _navigateToBuilder(template['name']!),
                icon: const Icon(Icons.arrow_forward, size: 18),
                label: const Text('Select Template'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Delete Dialog ────────────────────────────────────────────────
  void _showDeleteDialog(Map<String, dynamic> resume) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Resume'),
        content: Text('Are you sure you want to delete "${resume['name']}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              setState(() => _resumes.remove(resume));
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Resume deleted'), backgroundColor: Color(0xFF00C853)),
              );
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

// Full-screen Resume Detail Page
class _ResumeDetailPage extends StatelessWidget {
  final Map<String, dynamic> resume;
  final Color color;
  final IconData icon;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ResumeDetailPage({
    required this.resume,
    required this.color,
    required this.icon,
    required this.onEdit,
    required this.onDelete,
  });

  static const Color _primaryColor = Color(0xFF00C853);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(resume['name'] ?? 'Resume Details'),
        backgroundColor: _primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Card(
              elevation: 3,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Icon(icon, color: color, size: 36),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      resume['name'] ?? 'Untitled',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        resume['templateType'] ?? 'N/A',
                        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Details section
            const Text('Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _detailRow(Icons.description, 'Resume Name', resume['name'] ?? 'Untitled'),
            _detailRow(Icons.category, 'Template Type', resume['templateType'] ?? 'N/A'),
            _detailRow(Icons.calendar_today, 'Last Modified', resume['lastModified'] ?? 'Unknown'),
            _detailRow(Icons.folder, 'Status', 'Active'),

            const SizedBox(height: 20),

            // Preview section
            const Text('Resume Preview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Column(
                      children: [
                        Container(width: 80, height: 4, color: color),
                        const SizedBox(height: 16),
                        const Text('Your Name', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('email@example.com | +91-XXXXX-XXXXX',
                            style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                  _previewSection('Professional Summary', color),
                  _previewSection('Experience', color),
                  _previewSection('Education', color),
                  _previewSection('Skills', color),
                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      'Tap "Edit Resume" to fill in your details',
                      style: TextStyle(fontSize: 12, color: Colors.grey[500], fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit, size: 18),
                    label: const Text('Edit Resume'),
                    style: FilledButton.styleFrom(
                      backgroundColor: _primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onDelete,
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Delete'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500])),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _previewSection(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 4, height: 16, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 6),
          Container(height: 8, width: double.infinity, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 4),
          Container(height: 8, width: MediaQueryData().size.width * 0.6, decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(4))),
        ],
      ),
    );
  }
}
