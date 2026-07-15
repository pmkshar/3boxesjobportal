import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AiBuddyScreen extends StatefulWidget {
  const AiBuddyScreen({super.key});

  @override
  State<AiBuddyScreen> createState() => _AiBuddyScreenState();
}

class _ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  _ChatMessage({required this.text, required this.isUser, DateTime? timestamp})
      : timestamp = timestamp ?? DateTime.now();
}

class _AiBuddyScreenState extends State<AiBuddyScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isTyping = false;
  String? _sessionId;

  static const Color _primaryGreen = Color(0xFF00C853);

  static const List<Map<String, dynamic>> _quickActions = [
    {'label': 'Write Resume', 'icon': Icons.description_outlined, 'prompt': 'Help me write a professional resume'},
    {'label': 'Interview Tips', 'icon': Icons.record_voice_over_outlined, 'prompt': 'Give me interview tips and preparation advice'},
    {'label': 'Career Advice', 'icon': Icons.trending_up_outlined, 'prompt': 'I need career advice to advance in my field'},
    {'label': 'Salary Negotiation', 'icon': Icons.attach_money_outlined, 'prompt': 'How should I negotiate my salary?'},
  ];

  // Demo responses for offline mode
  static const Map<String, String> _demoResponses = {
    'resume':
        "I'd love to help you write a resume! Here are the key sections you should include:\n\n1. **Contact Information** – Name, email, phone, LinkedIn\n2. **Professional Summary** – 2-3 lines about your expertise\n3. **Work Experience** – Use bullet points with quantified achievements\n4. **Education** – Degrees and relevant coursework\n5. **Skills** – Technical and soft skills organized by category\n\nWould you like me to help you draft any specific section?",
    'interview':
        "Great question! Here are my top interview tips:\n\n1. **Research the company** – Know their mission, products, and recent news\n2. **Practice STAR method** – Structure answers: Situation, Task, Action, Result\n3. **Prepare questions** – Show genuine interest in the role\n4. **Body language** – Maintain eye contact and confident posture\n5. **Follow up** – Send a thank-you email within 24 hours\n\nWant me to do a mock interview with you?",
    'career':
        "Here's some career advancement advice:\n\n1. **Set clear goals** – Define where you want to be in 2-5 years\n2. **Build your network** – 70% of jobs are found through networking\n3. **Continuous learning** – Stay updated with industry trends and certifications\n4. **Seek mentorship** – Find someone who's where you want to be\n5. **Document achievements** – Keep a 'brag file' of your accomplishments\n\nWhat specific area would you like to explore further?",
    'salary':
        "Salary negotiation can feel daunting, but these strategies help:\n\n1. **Know your market value** – Research salary ranges on Glassdoor/Payscale\n2. **Wait for the offer** – Let them name a number first if possible\n3. **Use specific numbers** – Instead of 'more', say 'I was expecting \$X based on...'\n4. **Consider total compensation** – Benefits, equity, bonuses, PTO\n5. **Practice your pitch** – Rehearse until it feels natural\n\nRemember: Employers expect negotiation. It shows confidence!",
    'default':
        "That's an interesting question! Let me think about that...\n\nI can help you with resume writing, interview preparation, career planning, and salary negotiation. Feel free to ask me anything related to your career development!\n\nWhat would you like to explore?",
  };

  @override
  void initState() {
    super.initState();
    // Pre-loaded greeting message from AI
    _messages.add(_ChatMessage(
      text:
          "Hello! 👋 I'm your AI Career Buddy. I'm here to help you with resume writing, interview preparation, career advice, and salary negotiation.\n\nHow can I assist you today?",
      isUser: false,
    ));
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _getDemoResponse(String userMessage) {
    final lower = userMessage.toLowerCase();
    if (lower.contains('resume') || lower.contains('cv')) return _demoResponses['resume']!;
    if (lower.contains('interview')) return _demoResponses['interview']!;
    if (lower.contains('career') || lower.contains('advance') || lower.contains('growth')) {
      return _demoResponses['career']!;
    }
    if (lower.contains('salary') || lower.contains('negotiat') || lower.contains('pay')) {
      return _demoResponses['salary']!;
    }
    return _demoResponses['default']!;
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(text: text.trim(), isUser: true));
      _isTyping = true;
    });
    _inputController.clear();
    _scrollToBottom();

    try {
      final response = await ApiService.sendBuddyMessage(text.trim(), sessionId: _sessionId);
      if (response.containsKey('sessionId')) {
        _sessionId = response['sessionId'] as String?;
      }
      final aiText = response['response'] as String? ?? response['message'] as String? ?? '';
      if (aiText.isNotEmpty) {
        await _simulateTypingDelay();
        if (mounted) {
          setState(() {
            _messages.add(_ChatMessage(text: aiText, isUser: false));
            _isTyping = false;
          });
          _scrollToBottom();
        }
      } else {
        throw Exception('Empty response');
      }
    } catch (_) {
      // Fallback to demo response
      await _simulateTypingDelay();
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(text: _getDemoResponse(text.trim()), isUser: false));
          _isTyping = false;
        });
        _scrollToBottom();
      }
    }
  }

  Future<void> _simulateTypingDelay() async {
    await Future.delayed(const Duration(milliseconds: 1200));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.smart_toy_outlined, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('AI Career Buddy', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w600)),
                Text(
                  _isTyping ? 'typing...' : 'Online',
                  style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.8)),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: _primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Quick action cards
          _buildQuickActions(theme),
          const Divider(height: 1),
          // Chat messages
          Expanded(child: _buildChatList(theme)),
          // Typing indicator
          if (_isTyping) _buildTypingIndicator(),
          // Input bar
          _buildInputBar(theme),
        ],
      ),
    );
  }

  // ── Quick Actions ────────────────────────────────────────────────
  Widget _buildQuickActions(ThemeData theme) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: _quickActions.map((action) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ActionChip(
                avatar: Icon(action['icon'] as IconData, size: 18, color: _primaryGreen),
                label: Text(action['label'] as String),
                labelStyle: TextStyle(
                  color: _primaryGreen,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
                side: const BorderSide(color: Color(0xFFE0E0E0)),
                backgroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                onPressed: () => _sendMessage(action['prompt'] as String),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  // ── Chat List ────────────────────────────────────────────────────
  Widget _buildChatList(ThemeData theme) {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final msg = _messages[index];
        return _buildMessageBubble(theme, msg);
      },
    );
  }

  Widget _buildMessageBubble(ThemeData theme, _ChatMessage msg) {
    final isUser = msg.isUser;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (!isUser) ...[
              CircleAvatar(
                radius: 16,
                backgroundColor: _primaryGreen.withOpacity(0.15),
                child: const Icon(Icons.smart_toy, size: 18, color: _primaryGreen),
              ),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isUser ? _primaryGreen : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(isUser ? 18 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 18),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      msg.text,
                      style: TextStyle(
                        color: isUser ? Colors.white : Colors.grey[800],
                        fontSize: 14.5,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatTime(msg.timestamp),
                      style: TextStyle(
                        color: isUser ? Colors.white70 : Colors.grey[400],
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (isUser) ...[
              const SizedBox(width: 8),
              CircleAvatar(
                radius: 16,
                backgroundColor: _primaryGreen.withOpacity(0.15),
                child: const Icon(Icons.person, size: 18, color: _primaryGreen),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── Typing Indicator ─────────────────────────────────────────────
  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.fromLTRB(12, 0, 12, 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: _primaryGreen.withOpacity(0.15),
              child: const Icon(Icons.smart_toy, size: 18, color: _primaryGreen),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                  bottomLeft: Radius.circular(4),
                  bottomRight: Radius.circular(18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const _TypingDots(),
            ),
          ],
        ),
      ),
    );
  }

  // ── Input Bar ────────────────────────────────────────────────────
  Widget _buildInputBar(ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _inputController,
                textInputAction: TextInputAction.send,
                onSubmitted: _sendMessage,
                enabled: !_isTyping,
                decoration: InputDecoration(
                  hintText: 'Ask me anything about your career...',
                  hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(color: _primaryGreen, width: 1.5),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  filled: true,
                  fillColor: const Color(0xFFF5F7FA),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: BoxDecoration(
                color: _isTyping ? Colors.grey[300] : _primaryGreen,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                onPressed: _isTyping ? null : () => _sendMessage(_inputController.text),
                icon: const Icon(Icons.send_rounded, color: Colors.white, size: 22),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final hour = dt.hour.toString().padLeft(2, '0');
    final minute = dt.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

// ── Typing Dots Animation ──────────────────────────────────────────
class _TypingDots extends StatefulWidget {
  const _TypingDots();

  @override
  State<_TypingDots> createState() => _TypingDotsState();
}

class _TypingDotsState extends State<_TypingDots> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final progress = (_controller.value * 3 - index).clamp(0.0, 1.0);
            final scale = 0.5 + 0.5 * (0.5 + 0.5 * (1 - (2 * progress - 1).abs()));
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 2.5),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: Color(0xFF00C853).withOpacity(0.4 + 0.6 * scale),
                shape: BoxShape.circle,
              ),
            );
          }),
        );
      },
    );
  }
}
