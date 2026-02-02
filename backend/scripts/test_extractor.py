
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.utils.tech_extractor import extract_tech_stack

def test_extractor():
    samples = [
        "C++ разработчик",
        "DevOps Engineer",
        "Python Backend Developer",
        "Senior Java Developer",
        "Rust / Go Engineer"
    ]
    
    for text in samples:
        print(f"Text: '{text}' -> Found: {extract_tech_stack(text)}")

if __name__ == "__main__":
    test_extractor()
