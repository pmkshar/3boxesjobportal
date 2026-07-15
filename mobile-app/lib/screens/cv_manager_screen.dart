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
                // TODO: Open resume editor
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
