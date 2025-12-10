import requests
import os
from PIL import Image
from io import BytesIO
import time

class ImageFetcher:
    """Utility class to fetch and process images from the internet"""
    
    @staticmethod
    def fetch_image(url, save_path=None):
        """Fetch an image from URL and optionally save it"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                
                # Save image
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                    
                return save_path
            else:
                # Return image data
                return response.content
                
        except Exception as e:
            print(f"Error fetching image: {e}")
            return None
    
    @staticmethod
    def get_placeholder_images(count=6):
        """Get placeholder images from Unsplash for the dating app"""
        # Using Unsplash source URLs for placeholder images
        base_urls = [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
            "https://images.unsplash.com/photo-1494790108755-2616b786d4d6",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
            "https://images.unsplash.com/photo-1507591064344-4c6ce005-128"
        ]
        
        # Add parameters for consistent sizing
        urls = []
        for url in base_urls[:min(count, len(base_urls))]:
            urls.append(f"{url}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80")
        
        # If we need more images than we have, duplicate some
        while len(urls) < count:
            urls.append(urls[len(urls) % len(base_urls)])
            
        return urls
