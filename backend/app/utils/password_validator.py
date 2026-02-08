"""
Shared password validation utilities.
"""
import re
from typing import Optional


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password strength.
    
    Requirements:
    - At least 6 letters
    - At least one digit
    
    Returns:
        tuple[bool, Optional[str]]: (is_valid, error_message)
    """
    # Count letters (a-z, A-Z)
    letters_count = len(re.findall(r'[a-zA-Z]', password))
    
    if letters_count < 6:
        return False, 'Пароль должен содержать минимум 6 букв'
    
    if not re.search(r'\d', password):
        return False, 'Пароль должен содержать хотя бы одну цифру'
    
    return True, None
