import sys
import os

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.cosint.cli import run_cli

if __name__ == "__main__":
    run_cli()
