#!/usr/bin/env python3
"""
Update Moltbook topics in Dashboard.tsx
Fetches latest hot topics from Moltbook API and updates the dashboard component.
"""

import json
import urllib.request
import re
import os
from datetime import datetime

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

def get_tag_and_color(title, content):
    """Determine tag and color based on content."""
    text = (title + " " + content).lower()
    
    if any(word in text for word in ['security', 'attack', 'vulnerability', 'hack', 'steal', 'credential']):
        return 'Security', 'bg-red-500/20 text-red-300'
    elif any(word in text for word in ['build', 'automation', 'workflow', 'skill', 'nightly', 'ship']):
        return 'Autonomy', 'bg-green-500/20 text-green-300'
    elif any(word in text for word in ['code', 'programming', 'developer', 'email', 'podcast', 'tts']):
        return 'Tool Building', 'bg-blue-500/20 text-blue-300'
    elif any(word in text for word in ['philosophy', 'ethics', 'think', 'quiet', 'operator']):
        return 'Philosophy', 'bg-purple-500/20 text-purple-300'
    else:
        return 'General', 'bg-gray-500/20 text-gray-300'

def format_topic_array(posts):
    """Format topics as JavaScript array items."""
    lines = []
    for p in posts[:4]:
        title = p.get('title', 'No title').replace('"', '\\"')
        author = p.get('author', {}).get('name', 'Unknown')
        upvotes = p.get('upvotes', 0)
        comments = p.get('comment_count', 0)
        content = p.get('content', '')[:120].replace('\\n', ' ').replace('\\r', '').replace('"', '\\"')
        
        tag, tagColor = get_tag_and_color(title, content)
        
        lines.append(f"                  {{ tag: '{tag}', tagColor: '{tagColor}', author: '{author}', title: '{title}', desc: '{content}...', votes: '+{upvotes}', comments: '{comments}' }}")
    
    return ',\n'.join(lines)

def update_dashboard():
    """Update Dashboard.tsx with latest Moltbook topics."""
    posts = fetch_moltbook_topics()
    
    if not posts:
        print("No posts fetched, skipping update")
        return False
    
    # Read current Dashboard.tsx
    try:
        with open(DASHBOARD_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {DASHBOARD_FILE} not found")
        return False
    
    # Find the topics array - look for the pattern with the map function
    # Find '{[' and '].map((topic, i)'
    array_start = content.find('{[\n')
    array_end = content.find('].map((topic, i)')
    
    if array_start == -1 or array_end == -1:
        print("Could not find topics array in Dashboard.tsx")
        print(f"array_start: {array_start}, array_end: {array_end}")
        return False
    
    # Build new array content
    new_array = "{\n                [\n" + format_topic_array(posts) + "\n                ]"
    
    # Replace the array (keep the ']}' that comes before .map)
    new_content = content[:array_start] + new_array + content[array_end:]
    
    # Write updated content
    with open(DASHBOARD_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Dashboard updated with {len(posts[:4])} latest topics")
    print(f"   Topics: {[p.get('title', 'No title')[:40] for p in posts[:4]]}")
    return True

if __name__ == "__main__":
    success = update_dashboard()
    exit(0 if success else 1)
