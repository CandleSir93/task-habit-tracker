import os
import sys
from app import app

if __name__ == '__main__':
    # Get port from command line arg or default to 5000
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    
    # Add initialization code here if needed
    print(f"Starting server on http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=port, debug=True)
