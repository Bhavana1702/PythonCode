document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profileCard = document.getElementById('profile-card');
    const profileImage = document.getElementById('profile-image');
    const profileName = document.getElementById('profile-name');
    const profileAge = document.getElementById('profile-age');
    const profileLocation = document.getElementById('profile-location');
    const profileBio = document.getElementById('profile-bio');
    const interestsList = document.getElementById('interests-list');
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const superlikeBtn = document.getElementById('superlike-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const noProfiles = document.getElementById('no-profiles');
    const matchNotification = document.getElementById('match-notification');
    const matchMessage = document.getElementById('match-message');
    const matchName = document.getElementById('match-name');
    const closeMatchBtn = document.getElementById('close-match-btn');
    const matchesList = document.getElementById('matches-list');
    const totalProfiles = document.getElementById('total-profiles');
    const totalMatches = document.getElementById('total-matches');
    const matchesBadge = document.getElementById('matches-badge');
    const matchRate = document.getElementById('match-rate');
    const matchRateCircle = document.getElementById('match-rate-circle');
    const ageSlider = document.getElementById('age-range');
    const ageValue = document.getElementById('age-value');
    
    // State variables
    let currentProfileIndex = 0;
    let profiles = [];
    let matches = [];
    let viewedProfiles = new Set();
    
    // Initialize the app
    initApp();
    
    // Event Listeners
    likeBtn.addEventListener('click', () => handleLike());
    dislikeBtn.addEventListener('click', () => handleDislike());
    superlikeBtn.addEventListener('click', () => handleSuperLike());
    refreshBtn.addEventListener('click', () => loadProfiles());
    closeMatchBtn.addEventListener('click', () => matchNotification.style.display = 'none');
    
    ageSlider.addEventListener('input', () => {
        const age = ageSlider.value;
        ageValue.textContent = `18-${age}`;
    });
    
    // Initialize the app
    function initApp() {
        loadProfiles();
        updateStats();
        
        // Add swipe functionality for mobile
        initSwipe();
    }
    
    // Load profiles from the API
    function loadProfiles() {
        fetch('/api/profiles')
            .then(response => response.json())
            .then(data => {
                profiles = data;
                currentProfileIndex = 0;
                viewedProfiles.clear();
                
                if (profiles.length > 0) {
                    noProfiles.style.display = 'none';
                    profileCard.style.display = 'block';
                    showProfile(currentProfileIndex);
                } else {
                    noProfiles.style.display = 'block';
                    profileCard.style.display = 'none';
                }
                
                updateStats();
            })
            .catch(error => {
                console.error('Error loading profiles:', error);
            });
    }
    
    // Show a specific profile
    function showProfile(index) {
        if (index >= profiles.length) {
            noProfiles.style.display = 'block';
            profileCard.style.display = 'none';
            return;
        }
        
        const profile = profiles[index];
        
        // Update UI with profile data
        profileImage.src = profile.image_url;
        profileName.textContent = profile.name;
        profileAge.textContent = profile.age;
        profileLocation.textContent = profile.location;
        profileBio.textContent = profile.bio;
        
        // Update interests
        interestsList.innerHTML = '';
        profile.interests.forEach(interest => {
            const interestEl = document.createElement('div');
            interestEl.className = 'interest';
            interestEl.textContent = interest;
            interestsList.appendChild(interestEl);
        });
        
        // Add animation
        profileCard.classList.remove('animate__fadeInRight');
        void profileCard.offsetWidth; // Trigger reflow
        profileCard.classList.add('animate__fadeInRight');
        
        // Mark as viewed
        viewedProfiles.add(profile.id);
    }
    
    // Handle like action
    function handleLike() {
        const currentProfile = profiles[currentProfileIndex];
        
        // Send like to server
        fetch('/api/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile_id: currentProfile.id }),
        })
        .then(response => response.json())
        .then(data => {
            // Show appropriate message
            if (data.status === 'match') {
                showMatchNotification(currentProfile, data.message);
                addMatch(currentProfile);
            } else {
                showToast(data.message, 'info');
            }
            
            // Move to next profile
            moveToNextProfile();
        })
        .catch(error => {
            console.error('Error liking profile:', error);
            showToast('Error processing your like', 'error');
        });
    }
    
    // Handle dislike action
    function handleDislike() {
        const currentProfile = profiles[currentProfileIndex];
        
        // Send dislike to server
        fetch('/api/dislike', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile_id: currentProfile.id }),
        })
        .then(response => response.json())
        .then(data => {
            showToast(data.message, 'info');
            
            // Add swipe animation
            profileCard.classList.add('animate__fadeOutLeft');
            
            // Move to next profile after animation
            setTimeout(() => {
                moveToNextProfile();
            }, 300);
        })
        .catch(error => {
            console.error('Error disliking profile:', error);
            showToast('Error processing your dislike', 'error');
        });
    }
    
    // Handle super like action
    function handleSuperLike() {
        const currentProfile = profiles[currentProfileIndex];
        
        // Simulate super like (higher chance of match)
        const isMatch = Math.random() < 0.7; // 70% chance for super like
        
        if (isMatch) {
            showMatchNotification(currentProfile, `You super liked ${currentProfile.name} and it's a match!`);
            addMatch(currentProfile);
        } else {
            showToast(`You super liked ${currentProfile.name}!`, 'superlike');
        }
        
        // Add animation
        profileCard.classList.add('animate__pulse');
        
        // Move to next profile
        setTimeout(() => {
            moveToNextProfile();
        }, 1000);
    }
    
    // Move to the next profile
    function moveToNextProfile() {
        currentProfileIndex++;
        
        if (currentProfileIndex < profiles.length) {
            setTimeout(() => {
                showProfile(currentProfileIndex);
            }, 300);
        } else {
            // No more profiles
            setTimeout(() => {
                noProfiles.style.display = 'block';
                profileCard.style.display = 'none';
            }, 300);
        }
        
        // Update stats
        updateStats();
    }
    
    // Show match notification
    function showMatchNotification(profile, message) {
        matchName.textContent = profile.name;
        matchMessage.textContent = message;
        matchNotification.style.display = 'flex';
        
        // Play match sound (optional)
        // const audio = new Audio('/static/sounds/match.mp3');
        // audio.play();
    }
    
    // Add a match to the matches list
    function addMatch(profile) {
        // Check if already matched
        if (!matches.some(match => match.id === profile.id)) {
            matches.push(profile);
            updateMatchesList();
            updateStats();
        }
    }
    
    // Update the matches list in the sidebar
    function updateMatchesList() {
        matchesList.innerHTML = '';
        
        if (matches.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = 'No matches yet. Start swiping!';
            matchesList.appendChild(emptyMsg);
            return;
        }
        
        // Show latest 3 matches
        const recentMatches = matches.slice(-3).reverse();
        
        recentMatches.forEach(match => {
            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            
            matchItem.innerHTML = `
                <div class="match-avatar">
                    <img src="${match.image_url}" alt="${match.name}">
                </div>
                <div class="match-info">
                    <h4>${match.name}</h4>
                    <p>${match.age}, ${match.location}</p>
                </div>
            `;
            
            matchesList.appendChild(matchItem);
        });
    }
    
    // Update all statistics
    function updateStats() {
        // Update total profiles
        totalProfiles.textContent = profiles.length;
        
        // Update total matches
        totalMatches.textContent = matches.length;
        matchesBadge.textContent = matches.length;
        
        // Update match rate
        const rate = profiles.length > 0 ? Math.round((matches.length / profiles.length) * 100) : 0;
        matchRate.textContent = `${rate}%`;
        
        // Update match rate circle
        const percentage = Math.min(rate, 100);
        matchRateCircle.style.background = `conic-gradient(var(--primary-color) 0% ${percentage}%, #f0f0f0 ${percentage}% 100%)`;
        
        // Fetch stats from server
        fetch('/api/stats')
            .then(response => response.json())
            .then(data => {
                // You can update additional stats here if needed
            })
            .catch(error => console.error('Error fetching stats:', error));
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '12px 20px';
        toast.style.background = type === 'error' ? '#ff4757' : 
                                 type === 'superlike' ? '#2afadf' : 
                                 type === 'info' ? '#3742fa' : '#2ed573';
        toast.style.color = 'white';
        toast.style.borderRadius = '8px';
        toast.style.zIndex = '10000';
        toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        toast.style.fontWeight = '500';
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }
    
    // Initialize swipe functionality for mobile
    function initSwipe() {
        let startX, startY, distX, distY;
        const threshold = 50; // Minimum distance for swipe
        const restraint = 100; // Maximum vertical distance allowed
        const allowedTime = 500; // Maximum time allowed
        
        let startTime, elapsedTime;
        
        profileCard.addEventListener('touchstart', function(e) {
            const touchObj = e.changedTouches[0];
            startX = touchObj.pageX;
            startY = touchObj.pageY;
            startTime = new Date().getTime();
        }, false);
        
        profileCard.addEventListener('touchmove', function(e) {
            e.preventDefault(); // Prevent scrolling while swiping
        }, false);
        
        profileCard.addEventListener('touchend', function(e) {
            const touchObj = e.changedTouches[0];
            distX = touchObj.pageX - startX;
            distY = touchObj.pageY - startY;
            elapsedTime = new Date().getTime() - startTime;
            
            // Check if swipe meets conditions
            if (elapsedTime <= allowedTime) {
                if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                    // Horizontal swipe
                    if (distX > 0) {
                        // Right swipe (like)
                        handleLike();
                    } else {
                        // Left swipe (dislike)
                        handleDislike();
                    }
                }
            }
        }, false);
        
        // Also support mouse drag for desktop testing
        let mouseDown = false;
        let mouseStartX;
        
        profileCard.addEventListener('mousedown', function(e) {
            mouseDown = true;
            mouseStartX = e.pageX;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!mouseDown) return;
            
            const dist = e.pageX - mouseStartX;
            
            // Add visual feedback during drag
            if (Math.abs(dist) > 10) {
                const rotation = dist * 0.05;
                profileCard.style.transform = `translateX(${dist}px) rotate(${rotation}deg)`;
                
                // Change background color based on direction
                if (dist > 0) {
                    profileCard.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                } else {
                    profileCard.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                }
            }
        });
        
        document.addEventListener('mouseup', function(e) {
            if (!mouseDown) return;
            
            mouseDown = false;
            const dist = e.pageX - mouseStartX;
            
            // Reset card position
            profileCard.style.transform = '';
            profileCard.style.backgroundColor = '';
            
            // Check if it's a swipe
            if (Math.abs(dist) > 100) {
                if (dist > 0) {
                    // Right swipe (like)
                    handleLike();
                } else {
                    // Left swipe (dislike)
                    handleDislike();
                }
            }
        });
    }
    
    // Load matches on page load
    function loadMatches() {
        fetch('/api/matches')
            .then(response => response.json())
            .then(data => {
                matches = data;
                updateMatchesList();
                updateStats();
            })
            .catch(error => console.error('Error loading matches:', error));
    }
    
    // Initialize matches
    loadMatches();
});
