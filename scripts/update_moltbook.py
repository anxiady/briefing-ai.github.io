#!/usr/bin/env python3
"""
Update Moltbook topics in Dashboard.tsx
Fetches latest hot topics from Moltbook API and updates the dashboard component.
"""

import json
import urllib.request
import re
from datetime import datetime

import os

MOLTBOOK_API_KEY = os.environ.get("MOLTBOOK_API_KEY", "moltbook_sk_mwCjwMN5P50KQ7xilBjaNvPrYm0BJ2lt")
API_URL = "https://www.moltbook.com/api/v1/feed"
DASHBOARD_FILE = "src/pages/Dashboard.tsx"

def fetch_moltbook_topics():
    """Fetch latest topics from Moltbook."""
    req = urllib.request.Request(
        API_URL,
        headers={
            "X-API-Key": MOLTBOOK_API_KEY,
            "Accept": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('posts', [])
    except Exception as e:
        print(f"Error fetching Moltbook: {e}")
        return []

def format_topic_card(post, index):
    """Format a single topic card."""
    title = post.get('title', 'No title')
    author = post.get('author', {}).get('name', 'Unknown')
    upvotes = post.get('upvotes', 0)
    comments = post.get('comment_count', 0)
    content = post.get('content', '')[:150].replace('\\n', ' ').replace('\\r', '')
    
    # Determine category/tag based on content
    category = "General"
    cat_color = "bg-gray-100 text-gray-700"
    
    if any(word in title.lower() for word in ['security', 'attack', 'vulnerability', 'hack']):
        category = "Security"
        cat_color = "bg-red-100 text-red-700"
    elif any(word in title.lower() for word in ['build', 'automation', 'workflow', 'skill']):
        category = "Automation"
        cat_color = "bg-green-100 text-green-700"
    elif any(word in title.lower() for word in ['code', 'programming', 'developer']):
        category = "Development"
        cat_color = "bg-blue-100 text-blue-700"
    elif any(word in title.lower() for word in ['philosophy', 'ethics', 'think']):
        category = "Philosophy"
        cat_color = "bg-purple-100 text-purple-700"
    
    return f'''            {{/* Topic {index} */}}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 {cat_color} text-xs font-medium rounded-full">{category}</span>
                    <span className="text-xs text-gray-500">by {author}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{content}...</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-orange-600">
                      <TrendingUp size={16} />
                      +{upvotes} votes
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageCircle size={16} />
                      {comments} comments
                    </span>
                  </div>
                </div>
              </div>
            </div>'''

def update_dashboard():
    """Update Dashboard.tsx with latest Moltbook topics."""
    posts = fetch_moltbook_topics()
    
    if not posts:
        print("No posts fetched, skipping update")
        return False
    
    # Get top 4 posts
    top_posts = posts[:4]
    
    # Generate new topic cards
    topic_cards = "\n".join([format_topic_card(post, i+1) for i, post in enumerate(top_posts)])
    
    # Read current Dashboard.tsx
    try:
        with open(DASHBOARD_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {DASHBOARD_FILE} not found")
        return False
    
    # Find and replace the topics section
    # Pattern: {/* Topic 1 */} through {/* Topic 4 */} with all content between
    pattern = r'            \{/?\* Topic 1 \*/?\}.*?\{/?\* Topic 4 \*/?\}'
    
    replacement = topic_cards
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Also update the timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M UTC")
    new_content = re.sub(
        r'Updated: .*? UTC',
        f'Updated: {timestamp}',
        new_content
    )
    
    # Write updated content
    with open(DASHBOARD_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Dashboard updated with {len(top_posts)} latest topics")
    print(f"   Last updated: {timestamp}")
    return True

if __name__ == "__main__":
    success = update_dashboard()
    exit(0 if success else 1)
