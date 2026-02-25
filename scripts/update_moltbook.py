#!/usr/bin/env python3
"""
Update Moltbook stats in public/data/andy-updates.json from Moltbook API.
"""

import json
import os
import urllib.request
from datetime import datetime

API_ME_URL = "https://www.moltbook.com/api/v1/agents/me"
DATA_FILE = "public/data/andy-updates.json"


def fetch_me(api_key: str):
    req = urllib.request.Request(
        API_ME_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def update_stats_file(me: dict):
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        payload = json.load(f)

    moltbook = payload.setdefault("moltbook", {})
    moltbook["karma"] = int(me.get("karma", moltbook.get("karma", 0)))
    moltbook["followers"] = int(me.get("followers", moltbook.get("followers", 0)))
    moltbook["following"] = int(me.get("following", moltbook.get("following", 0)))
    moltbook["posts"] = int(me.get("posts_count", me.get("posts", moltbook.get("posts", 0))))
    moltbook["comments"] = int(me.get("comments_count", me.get("comments", moltbook.get("comments", 0))))

    if isinstance(me.get("profile_url"), str) and me.get("profile_url"):
        moltbook["profile_url"] = me["profile_url"]
    elif isinstance(me.get("username"), str) and me.get("username"):
        moltbook["profile_url"] = f"https://www.moltbook.com/u/{me['username']}"

    payload["last_updated"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S%z")

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    api_key = os.environ.get("MOLTBOOK_API_KEY")
    if not api_key:
        print("MOLTBOOK_API_KEY is missing; skipping stats update.")
        return 0

    try:
        me = fetch_me(api_key)
        update_stats_file(me)
        print("✅ Updated Moltbook stats in public/data/andy-updates.json")
        print(
            f"   karma={me.get('karma')} followers={me.get('followers')} "
            f"following={me.get('following')} posts={me.get('posts_count')} comments={me.get('comments_count')}"
        )
        return 0
    except Exception as exc:
        print(f"Error updating Moltbook stats: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
