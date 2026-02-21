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
API_URL = "https://www.moltbook.com/api/v1/feed?sort=new"
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
        post_id = p.get('id', '')
        title = p.get('title', 'No title').replace('"', '\\"').replace("'", "\\'")
        author = p.get('author', {}).get('name', 'Unknown')
        upvotes = p.get('upvotes', 0)
        comments = p.get('comment_count', 0)
        
        # Get content and clean it up - handle actual newlines and escape for JS
        content = p.get('content', '')[:120]
        # Replace actual newlines with spaces
        content = content.replace('\n', ' ').replace('\r', ' ')
        # Replace multiple spaces with single space
        content = ' '.join(content.split())
        # Escape quotes (both single and double)
        content = content.replace('"', '\\"').replace("'", "\\'")
        
        tag, tagColor = get_tag_and_color(title, content)
        
        lines.append(f"                  {{ tag: '{tag}', tagColor: '{tagColor}', author: '{author}', title: '{title}', desc: '{content}...', votes: '+{upvotes}', comments: '{comments}', postId: '{post_id}' }}")
    
    return ',\n'.join(lines)

def calculate_trending_score(post):
    """Calculate trending score for new posts - raw engagement."""
    from datetime import datetime, timezone
    
    upvotes = post.get('upvotes', 0)
    comments = post.get('comment_count', 0)
    created = post.get('created_at', '')
    
    if not created:
        return 0
    
    try:
        post_time = datetime.fromisoformat(created.replace('Z', '+00:00'))
        hours_ago = (datetime.now(timezone.utc) - post_time).total_seconds() / 3600
        
        # For new feed: prioritize newest posts with some engagement
        # Score = (upvotes + comments*2) / hours_since_posted
        # This gives us hot new posts that are gaining traction quickly
        engagement = upvotes + (comments * 2)
        
        # If post is less than 1 hour old, use minimum 0.5 to avoid divide by zero
        time_factor = max(hours_ago, 0.5)
        
        return engagement / time_factor
    except:
        return 0

def update_dashboard():
    """Update Dashboard.tsx with latest TRENDING Moltbook topics."""
    posts = fetch_moltbook_topics()
    
    if not posts:
        print("No posts fetched, skipping update")
        return False
    
    # Sort by trending score (new + high engagement) instead of just votes
    posts.sort(key=calculate_trending_score, reverse=True)
    
    # Read current Dashboard.tsx
    try:
        with open(DASHBOARD_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {DASHBOARD_FILE} not found")
        return False
    
    # Find the Moltbook topics array
    # Look for the specific pattern: {\n                [\n                  { tag:
    array_marker = "{\n                [\n                  { tag:"
    array_start = content.find(array_marker)
    array_end = content.find('].map((topic, i)', array_start)
    
    if array_start == -1 or array_end == -1:
        print("Could not find topics array in Dashboard.tsx")
        print(f"array_start: {array_start}, array_end: {array_end}")
        return False
    
    # Build new array content (without closing bracket, we'll keep that from original)
    new_array = "{\n                [\n" + format_topic_array(posts)
    
    # Replace from array_start to array_end+1 (include the ']' in what we replace)
    # array_end points to ']', so we go to array_end+1 to include it
    new_content = content[:array_start] + new_array + content[array_end+1:]
    
    # Write updated content
    with open(DASHBOARD_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Dashboard updated with {len(posts[:4])} TRENDING topics (new + high engagement)")
    for i, p in enumerate(posts[:4], 1):
        score = calculate_trending_score(p)
        print(f"   {i}. {p.get('title', 'No title')[:45]}... (score: {score:.1f})")
    return True

if __name__ == "__main__":
    success = update_dashboard()
    exit(0 if success else 1)
