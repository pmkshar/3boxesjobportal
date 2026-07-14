import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';

class AiBuddyScreen extends StatefulWidget {
  const AiBuddyScreen({super.key});

  @override
  State<AiBuddyScreen> createState() => _AiBuddyScreenState();
}

class _AiBuddyScreenState extends State<AiBuddyScreen> {
  final List<_ChatMessage> _messages = [];
  final _inputController = TextEditingController();
  bool _isTyping = false;

  final List<Map<String, dynamic>> _quickActions = [
    {'icon': Icons.work_outline, 'label': 'Career Advice', 'prompt': 'Give me career advice for advancing in my field'},
    {'icon': Icons.description, 'label': 'Resume Tips', 'prompt': 'What are the best resume tips for 2024?'},
    {'icon': Icons.psychology, 'label': 'Interview Prep', 'prompt': 'Help me prepare for a technical interview'},
    {'icon': Icons.trending_up, 'label': 'Salary Negotiation', 'prompt': 'How should I negotiate my salary?'},
    {'icon': Icons.school, 'label': 'Skill Development', 'prompt': 'What skills should I learn to advance my career?'},
    {'icon': Icons.people, 'label': 'Networking', 'prompt': 'Tips for professional networking'},
  ];

  final List<String> _aiResponses = [
    "That's a great question! Based on current industry trends, I'd recommend focusing on building both technical and soft skills. Employers increasingly value adaptability and communication alongside domain expertise.",
    "Here's my advice: Start by identifying your key strengths and aligning them with market demand. Consider taking online courses in emerging technologies and contributing to open-source projects to build your portfolio.",
    "For interview preparation, I suggest the STAR method: Structure your answers around Situation, Task, Action, and Result. Practice with a friend or record yourself to improve delivery and confidence.",
    "When negotiating salary, research the market rate for your role and location first. Present your value proposition clearly, focus on the impact you'll bring, and be prepared to discuss the full compensation package including benefits.",
    "I'd recommend focusing on skills that are in high demand: data analysis, cloud computing, AI/ML fundamentals, and project management. These complement virtually any career path and open new opportunities.",
    "Networking is crucial! Start with LinkedIn - engage with industry content, join relevant groups, and attend virtual events. Don't just connect; build genuine relationships by offering value first.",
  ];

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;
    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
      _isTyping = true;
    });
    _inputController.clear();

    // Simulate AI response
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        final response = _aiResponses[_messages.length % _aiResponses.length];
        setState(() {
          _messages.add(_ChatMessage(text: response, isUser: false));
          _isTyping = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.smart_toy, color: Color(0xFF6366F1), size: 18),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Buddy', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                Text('Always here to help', style: TextStyle(fontSize: 11, color: Color(0xFFA3B8D0))),
              ],
            ),
          ],
        ),
        backgroundColor: const Color(0xFF064E3B),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty ? _buildWelcome() : _buildChat(),
          ),
          _buildInput(),
        ],
      ),
    );
  }

  Widget _buildWelcome() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.smart_toy, color: Colors.white, size: 36),
          ),
          const SizedBox(height: 16),
          const Text('Hi! I\'m your AI Buddy', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
          const SizedBox(height: 8),
          const Text('I can help with career advice, resume tips, interview prep, and more!', style: TextStyle(fontSize: 14, color: Color(0xFF66789C)), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text('Quick Actions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF05264E))),
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.6,
            children: _quickActions.map((action) => GestureDetector(
              onTap: () => _sendMessage(action['prompt'] as String),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.15)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(action['icon'] as IconData, color: const Color(0xFF6366F1), size: 20),
                    const SizedBox(height: 6),
                    Text(action['label'] as String, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF05264E))),
                  ],
                ),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildChat() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _messages.length && _isTyping) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.smart_toy, color: Color(0xFF6366F1), size: 16),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE4E8EC)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFF6366F1).withOpacity(0.5))),
                      const SizedBox(width: 8),
                      const Text('Thinking...', style: TextStyle(fontSize: 13, color: Color(0xFF66789C))),
                    ],
                  ),
                ),
              ],
            ),
          );
        }
        final msg = _messages[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: msg.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            children: [
              if (!msg.isUser) ...[
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.smart_toy, color: Color(0xFF6366F1), size: 16),
                ),
                const SizedBox(width: 8),
              ],
              Container(
                constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: msg.isUser ? const Color(0xFF6366F1) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: msg.isUser ? null : Border.all(color: const Color(0xFFE4E8EC)),
                ),
                child: Text(
                  msg.text,
                  style: TextStyle(fontSize: 14, color: msg.isUser ? Colors.white : const Color(0xFF05264E), height: 1.5),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2))],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _inputController,
                onSubmitted: _sendMessage,
                decoration: InputDecoration(
                  hintText: 'Ask me anything about your career...',
                  hintStyle: const TextStyle(color: Color(0xFFC1C9D2)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: const BorderSide(color: Color(0xFFE4E8EC))),
                  filled: true,
                  fillColor: const Color(0xFFF9FAFB),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)]),
                borderRadius: BorderRadius.circular(22),
              ),
              child: IconButton(
                onPressed: () => _sendMessage(_inputController.text),
                icon: const Icon(Icons.send, color: Colors.white, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatMessage {
  final String text;
  final bool isUser;
  _ChatMessage({required this.text, required this.isUser});
}
