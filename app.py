from flask import Flask, render_template, jsonify, request, send_file
import random
import json
import os
from utils.image_fetcher import ImageFetcher

app = Flask(__name__)

# Sample dating profiles with image URLs from Unsplash
# These are placeholder images that will be fetched from Unsplash
PROFILES = [
    {
        "id": 1,
        "name": "Alex Morgan",
        "age": 28,
        "location": "New York",
        "bio": "Adventure seeker, coffee lover, and professional photographer. Looking for someone to explore the world with.",
        "interests": ["Photography", "Hiking", "Coffee", "Travel"],
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        "id": 2,
        "name": "Taylor Swift",
        "age": 32,
        "location": "Nashville",
        "bio": "Songwriter and musician. Love cats, rainy days, and good conversations.",
        "interests": ["Music", "Writing", "Cats", "Baking"],
        "image_url": "https://images.unsplash.com/photo-1494790108755-2616b786d4d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        "id": 3,
        "name": "Jordan Lee",
        "age": 30,
        "location": "San Francisco",
        "bio": "Tech entrepreneur who loves surfing and cooking. Looking for a partner in crime.",
        "interests": ["Surfing", "Technology", "Cooking", "Yoga"],
        "image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        "id": 4,
        "name": "Riley Smith",
        "age": 26,
        "location": "Chicago",
        "bio": "Graphic designer and art enthusiast. Love museums, indie films, and trying new restaurants.",
        "interests": ["Art", "Design", "Movies", "Food"],
        "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        "id": 5,
        "name": "Casey Kim",
        "age": 31,
        "location": "Seattle",
        "bio": "Environmental scientist and nature lover. Enjoy hiking, gardening, and sustainable living.",
        "interests": ["Nature", "Science", "Gardening", "Reading"],
        "image_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
        "id": 6,
        "name": "Morgan James",
        "age": 29,
        "location": "Austin",
        "bio": "Software developer and music festival enthusiast. Always up for trying something new.",
        "interests": ["Coding", "Music", "Travel", "Fitness"],
        "image_url": "https://images.unsplash.com/photo-1507591064344-4c6ce005-128?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
]

# User matches storage
user_matches = []

@app.route('/')
def index():
    """Render the main dating app page"""
    return render_template('index.html')

@app.route('/api/profiles')
def get_profiles():
    """Return all profiles"""
    return jsonify(PROFILES)

@app.route('/api/profiles/random')
def get_random_profile():
    """Return a random profile"""
    profile = random.choice(PROFILES)
    return jsonify(profile)

@app.route('/api/like', methods=['POST'])
def like_profile():
    """Handle liking a profile"""
    data = request.json
    profile_id = data.get('profile_id')
    
    # Find the profile
    profile = next((p for p in PROFILES if p['id'] == profile_id), None)
    
    if profile:
        # Check if it's a match (simulated - 30% chance)
        is_match = random.random() < 0.3
        
        if is_match:
            user_matches.append(profile)
            return jsonify({
                'status': 'match',
                'message': f"It's a match! You and {profile['name']} have liked each other!",
                'profile': profile
            })
        else:
            return jsonify({
                'status': 'liked',
                'message': f"You liked {profile['name']}! Waiting to see if they like you back."
            })
    
    return jsonify({'status': 'error', 'message': 'Profile not found'}), 404

@app.route('/api/dislike', methods=['POST'])
def dislike_profile():
    """Handle disliking a profile"""
    data = request.json
    profile_id = data.get('profile_id')
    
    profile = next((p for p in PROFILES if p['id'] == profile_id), None)
    
    if profile:
        return jsonify({
            'status': 'disliked',
            'message': f"You passed on {profile['name']}."
        })
    
    return jsonify({'status': 'error', 'message': 'Profile not found'}), 404

@app.route('/api/matches')
def get_matches():
    """Return user's matches"""
    return jsonify(user_matches)

@app.route('/api/stats')
def get_stats():
    """Return app statistics"""
    return jsonify({
        'total_profiles': len(PROFILES),
        'total_matches': len(user_matches),
        'match_rate': round(len(user_matches) / len(PROFILES) * 100, 1) if PROFILES else 0
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
