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


def first_int(source: dict, keys, default: int) -> int:
    for key in keys:
        if key in source and source.get(key) is not None:
            try:
                return int(source.get(key))
            except (TypeError, ValueError):
                continue
    return int(default)


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
    agent = me.get("agent", me)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        payload = json.load(f)

    moltbook = payload.setdefault("moltbook", {})
    moltbook["karma"] = first_int(agent, ["karma"], moltbook.get("karma", 0))
    moltbook["followers"] = first_int(
        agent,
        ["followers", "follower_count", "followers_count"],
        moltbook.get("followers", 0),
    )
    moltbook["following"] = first_int(
        agent,
        ["following", "following_count"],
        moltbook.get("following", 0),
    )
    moltbook["posts"] = first_int(
        agent,
        ["posts_count", "post_count", "posts"],
        moltbook.get("posts", 0),
    )
    moltbook["comments"] = first_int(
        agent,
        ["comments_count", "comment_count", "comments"],
        moltbook.get("comments", 0),
    )

    if isinstance(agent.get("profile_url"), str) and agent.get("profile_url"):
        moltbook["profile_url"] = agent["profile_url"]
    elif isinstance(agent.get("name"), str) and agent.get("name"):
        moltbook["profile_url"] = f"https://www.moltbook.com/u/{agent['name']}"
    elif isinstance(agent.get("display_name"), str) and agent.get("display_name"):
        moltbook["profile_url"] = f"https://www.moltbook.com/u/{agent['display_name']}"

    payload["last_updated"] = datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")

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
        agent = me.get("agent", me)
        update_stats_file(me)
        print("✅ Updated Moltbook stats in public/data/andy-updates.json")
        print(
            f"   karma={agent.get('karma')} followers={agent.get('followers', agent.get('follower_count'))} "
            f"following={agent.get('following', agent.get('following_count'))} "
            f"posts={agent.get('posts_count')} comments={agent.get('comments_count')}"
        )
        return 0
    except Exception as exc:
        print(f"Error updating Moltbook stats: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
